#nfcpyを用いたIDmを常時読み取り，HTTP POSTする機能．エラーハンドリングも行う．

# import nfc
# import requests
# import json

# # バックエンドのエンドポイントURL
# API_URL = 'http://localhost:3000/api/iccard'

# def on_connect(tag):
#     # Felica IDmを取得
#     idm = tag.identifier.hex()
#     print(f"Card detected: {idm}")

#     # データをバックエンドAPIに送信
#     data = {
#         'card_id': idm,
#         'room_id': 2  # 例として部屋IDを2とする。実際には適切な部屋IDを設定する
#     }
#     headers = {'Content-Type': 'application/json'}

#     try:
#         response = requests.post(API_URL, data=json.dumps(data), headers=headers)
#         if response.status_code == 200:
#             print(f"Server response: {response.json()['message']}")
#         else:
#             print(f"Error: {response.status_code}, {response.text}")
#     except requests.exceptions.RequestException as e:
#         print(f"Request failed: {e}")

#     return True

# def main():
#     clf = nfc.ContactlessFrontend()
#     assert clf.open('usb'), "NFC reader not found"
    
#     try:
#         while True:
#             clf.connect(rdwr={'on-connect': on_connect})
#     finally:
#         clf.close()

# if __name__ == "__main__":
#     main()