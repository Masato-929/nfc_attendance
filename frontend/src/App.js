import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomStatusTable from './components/RoomStatusTable';

const App = () => {
    const [status, setStatus] = useState([]);

    // サーバから現在の入室状況を取得する関数
    const fetchStatus = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching status data:', error);
        }
    };

    // コンポーネントがマウントされた時に実行
    useEffect(() => {
        // 初回のデータ取得
        fetchStatus();

        // WebSocket接続の確立
        const socket = new WebSocket(`ws://localhost:3000`);
        socket.onmessage = () => {
            fetchStatus();
        };

        return () => {
            socket.close(); // コンポーネントがアンマウントされた時にWebSocketを閉じる
        };
    }, []);

    return (
        <div>
            <h1>現在の入室状況</h1>
            <RoomStatusTable status={status} />
        </div>
    );
};

export default App;