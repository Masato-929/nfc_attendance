import requests
import json

# サーバのURLとエンドポイント
url = 'http://localhost:3000/api/iccard'  # 適宜、サーバのURLとポートに変更してください

def send_post_request(card_id, room_id):
    # リクエストボディの作成
    data = {
        'card_id': card_id,
        'room_id': room_id
    }
    
    # ヘッダーの設定
    headers = {
        'Content-Type': 'application/json'
    }
    
    # POSTリクエストの送信
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    # レスポンスの表示
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.json()}')

if __name__ == '__main__':
    # 手動で入力する部分
    card_id = input('Enter IDm (IC card identifier): ')
    room_id = int(input('Enter room_id: '))
    
    # POSTリクエストを送信
    send_post_request(card_id, room_id)