import cors from 'cors';
import mysql from 'mysql2/promise';  // mysql2/promise モジュールのインポート
import express from 'express';       // expressフレームワークのインポート
import bodyParser from 'body-parser'; // リクエストボディを解析するためのモジュールのインポート
import http from 'http';             // HTTPサーバーを作成するためのモジュールのインポート
import { createServer } from 'http'; // HTTPサーバーを作成するための関数のインポート
import { WebSocketServer } from 'ws';// WebSocketサーバー用のモジュールのインポート
import dotenv from 'dotenv';         // 環境変数をロードするためのモジュールのインポート
dotenv.config();                     // .envファイル内の変数をprocess.envにロード

const app = express();               // Expressアプリケーションの作成

app.use(cors()); // CORSを有効にする

const server = createServer(app);    // HTTPサーバーの作成
const wss = new WebSocketServer({ server }); // WebSocketサーバーの作成

// MySQLデータベース接続プールの設定
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(bodyParser.json());          // リクエストボディをJSON形式として解析するミドルウェアを使用

// ICカードの読み取り受信エンドポイントの設定
app.post('/api/iccard', async (req, res) => {
    const { card_id, room_id } = req.body;  // リクエストボディから必要なデータを抽出
    console.log(`Received POST request: card_id=${card_id}, room_id=${room_id}`);  // ログ追加

    try {
        const connection = await pool.getConnection(); // データベース接続の取得
        await connection.beginTransaction(); // トランザクションの開始

        try {
            // CardStatusテーブルからcard_idのエントリを取得
            const [cardStatusRows] = await connection.query('SELECT current_room_id FROM CardStatus WHERE card_id = ?', [card_id]);

            if (cardStatusRows.length === 0) {
                // IDmが存在しない場合はエラーレスポンスを返す
                res.status(404).json({ message: 'Card not recognized' });
                await connection.rollback(); // トランザクションのロールバック
                return;
            }

            const current_room_id = cardStatusRows[0].current_room_id; // 現在の部屋IDを取得

            if (current_room_id === room_id) {
                // 現在の部屋にいる場合はactionをexitにする
                await connection.query('INSERT INTO AccessLogs (card_id, room_id, action) VALUES (?, ?, ?)', [card_id, room_id, 'exit']);
                // 1は「未入室」を示す
                await connection.query('UPDATE CardStatus SET current_room_id = 1 WHERE card_id = ?', [card_id]);
                res.status(200).json({ message: 'Exited room' });
            } else {
                if (current_room_id !== 1) {
                    // 現在の部屋からexitするログを生成
                    await connection.query('INSERT INTO AccessLogs (card_id, room_id, action) VALUES (?, ?, ?)', [card_id, current_room_id, 'exit']);
                }
                // 新しい部屋にentryするログを生成
                await connection.query('INSERT INTO AccessLogs (card_id, room_id, action) VALUES (?, ?, ?)', [card_id, room_id, 'entry']);
                // カードのステータスを更新
                await connection.query('UPDATE CardStatus SET current_room_id = ? WHERE card_id = ?', [room_id, card_id]);
                res.status(200).json({ message: 'Entered room' });
            }

            await connection.commit(); // トランザクションをコミットして変更を確定

            // WebSocketを通じてクライアントに通知
            wss.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    const message = JSON.stringify({
                        card_id,
                        current_room_id: room_id,
                        action: current_room_id === room_id ? 'exit' : 'entry'
                    });
                    console.log(`Sending message: ${message}`);  // 送信メッセージの確認
                    client.send(message);
                }
            });
        } catch (err) {
            await connection.rollback(); // エラー発生時はトランザクションをロールバック
            throw err;
        } finally {
            connection.release(); // データベース接続を解放
        }
    } catch (err) {
        console.error(err); // エラーログの出力
        res.status(500).json({ message: 'Internal Server Error', error: err.message }); // エラーレスポンスの送信
    }
});

// 現在の入室状況を取得するエンドポイント
app.get('/api/status', async (req, res) => {
    try {
        const connection = await pool.getConnection(); // データベース接続の取得
        try {
            // 現在の入室状況を取得するクエリ
            const [rows] = await connection.query(
                `SELECT Users.username, Rooms.room_name 
                 FROM CardStatus 
                 INNER JOIN ICCards ON CardStatus.card_id = ICCards.card_id 
                 INNER JOIN Users ON ICCards.user_id = Users.user_id
                 INNER JOIN Rooms ON CardStatus.current_room_id = Rooms.room_id`
            );
            res.json(rows); // 取得したデータをレスポンスとして返す
        } finally {
            connection.release(); // データベース接続を解放
        }
    } catch (err) {
        console.error(err); // エラーログの出力
        res.status(500).json({ message: 'Internal Server Error', error: err.message }); // エラーレスポンスの送信
    }
});

// WebSocket接続のイベント処理
wss.on('connection', (ws) => {
    console.log('A client connected');

    ws.on('message', (message) => {
        console.log('Message received from client:', message);
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

// サーバの起動
const port = process.env.APP_PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);  // サーバ起動時にログを出力
});