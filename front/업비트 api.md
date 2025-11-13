# 업비트 api

# **페어 목록 조회**

**get**https://api.upbit.com/v1/market/all

업비트에서 지원하는 모든 페어 목록을 조회합니다.

```jsx
import requests

url = "https://api.upbit.com/v1/market/all"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
```

```jsx
[
  {
    "market": "KRW-BTC",
    "korean_name": "비트코인",
    "english_name": "Bitcoin",
    "market_event": {
      "warning": false,
      "caution": {
        "PRICE_FLUCTUATIONS": false,
        "TRADING_VOLUME_SOARING": false,
        "DEPOSIT_AMOUNT_SOARING": false,
        "GLOBAL_PRICE_DIFFERENCES": false,
        "CONCENTRATION_OF_SMALL_ACCOUNTS": false
      }
    }
  },
  {
    "market": "KRW-ETH",
    "korean_name": "이더리움",
    "english_name": "Ethereum",
    "market_event": {
      "warning": true,
      "caution": {
        "PRICE_FLUCTUATIONS": false,
        "TRADING_VOLUME_SOARING": false,
        "DEPOSIT_AMOUNT_SOARING": false,
        "GLOBAL_PRICE_DIFFERENCES": false,
        "CONCENTRATION_OF_SMALL_ACCOUNTS": false
      }
    }
  }
]
```

### **분(Minute) 캔들 조회**

**get** https://api.upbit.com/v1/candles/minutes/{unit}

분 단위 캔들 목록을 조회합니다.

### **분캔들 조회 단위(Unit)**

분 캔들 조회 API는 Unit Path 파라미터를 지원합니다. Unit은 분단위 내에서 캔들 하나당 조회 단위(캔들의 너비)를 지정하기 위한 파라미터 입니다. 현재 1, 3, 5, 10, 15, 30, 60, 240분 단위로 캔들 너비를 조정할 수 있으며, 예를 들어 `/v1/candles/minutes/5` 로 요청하는 경우 체결 정보를 5분 단위로 Group하여 캔들을 조회합니다.

**캔들은 해당 시간대에 체결이 발생한 경우에만 생성됩니다.**

해당 캔들의 시작시각부터 종료시각까지 체결이 발생하지 않은 경우 캔들이 생성되지 않으며, 응답에도 포함되지 않습니다. 예를 들어, candle_date_time이 2024-08-31T22:25:00인 분 캔들의 경우 22:25:00(이상)부터 22:26:00(미만)까지 체결이 발생하지 않은 경우 생성되지 않습니다.

분(Minute) 캔들 단위

캔들 단위를 지정하여 캔들 조회를 할 수 있습니다.

최대 240분(4시간) 캔들까지 조회할 수 있습니다.

```jsx
import requests

url = "https://api.upbit.com/v1/candles/minutes/1"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
```

```jsx
[
  {
    "market": "KRW-BTC",
    "candle_date_time_utc": "2025-07-01T12:00:00",
    "candle_date_time_kst": "2025-07-01T21:00:00",
    "opening_price": 145831000,
    "high_price": 145831000,
    "low_price": 145752000,
    "trade_price": 145759000,
    "timestamp": 1751327999833,
    "candle_acc_trade_price": 4022470467.03403,
    "candle_acc_trade_volume": 27.58904602,
    "unit": 1
  }
]
```

### **일(Day) 캔들 조회get**https://api.upbit.com/v1/candles/days일 단위 캔들 목록을 조회합니다.

### **종가 환산 통화(converting_price_unit)**

'converting_price_unit' 파라미터를 지정하여 원화 마켓이 아닌 다른 마켓(예시: BTC마켓)의 일 캔들 조회시 종가('trade_price')를 원화로 환산하여 조회할 수 있습니다. 파라미터를 원화('KRW')로 지정하는 경우 converted_trade_price 필드에 원화로 환산된 종가 정보가 반환됩니다. 현재 원화 환산만을 지원하고 있으며, 추후 지원 통화는 추가될 수 있습니다.

**캔들은 해당 시간대에 체결이 발생한 경우에만 생성됩니다.**

해당 캔들의 시작 시각부터 종료 시각까지 체결이 발생하지 않은 경우 캔들이 생성되지 않으며, 응답에도 포함되지 않습니다. 예를 들어, candle_date_time이 2024-08-31T00:00:00인 일 캔들의 경우 2024-08-31T00:00:00(이상)부터 2024-09-01T00:00:00(미만)까지 체결이 발생하지 않은 경우 생성되지 않습니다.

```jsx
import requests

url = "https://api.upbit.com/v1/candles/days"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
```

```jsx
[
  {
    "market": "KRW-BTC",
    "candle_date_time_utc": "2025-06-30T00:00:00",
    "candle_date_time_kst": "2025-06-30T09:00:00",
    "opening_price": 147996000,
    "high_price": 148480000,
    "low_price": 145740000,
    "trade_price": 145759000,
    "timestamp": 1751327999833,
    "candle_acc_trade_price": 138812096716.42776,
    "candle_acc_trade_volume": 944.35761221,
    "prev_closing_price": 147996000,
    "change_price": -2237000,
    "change_rate": -0.0151152734
  }
]
```

### **페어 단위 현재가 조회get**https://api.upbit.com/v1/ticker지정한 페어의 현재가를 조회합니다. 요청 시점 기준으로 해당 페어의 티커 스냅샷이 반환됩니다.

### **가격 변동 지표**

페어 현재가 조회시 반환되는 change, change_price, change_rate, signed_change_price, signed_change_rate 필드는 가격 변동에 관련된 지표를 반환하는 필드들입니다. 해당 변동 지표들은 **전일 종가를 기준으로** 산출합니다.

```jsx
import requests

url = "https://api.upbit.com/v1/ticker"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
```

```jsx
[
  {
    "market": "KRW-BTC",
    "trade_date": "20250704",
    "trade_time": "051400",
    "trade_date_kst": "20250704",
    "trade_time_kst": "141400",
    "trade_timestamp": 1751606040365,
    "opening_price": "148737000.00000000,",
    "high_price": "149360000.00000000,",
    "low_price": "148288000.00000000,",
    "trade_price": "148601000.00000000,",
    "prev_closing_price": "148737000.00000000,",
    "change": "FALL",
    "change_price": 136000,
    "change_rate": 0.0009143656,
    "signed_change_price": "-136000.00000000,",
    "signed_change_rate": -0.0009143656,
    "trade_volume": 0.00016823,
    "acc_trade_price": 31615925234.05438,
    "acc_trade_price_24h": 178448329314.96686,
    "acc_trade_volume": 212.38911576,
    "acc_trade_volume_24h": 1198.26954807,
    "highest_52_week_price": 163325000,
    "highest_52_week_date": "2025-01-20",
    "lowest_52_week_price": 72100000,
    "lowest_52_week_date": "2024-08-05",
    "timestamp": 1751606040403
  },
  {
    "market": "KRW-ETH",
    "trade_date": "20250704",
    "trade_time": "051400",
    "trade_date_kst": "20250704",
    "trade_time_kst": "141400",
    "trade_timestamp": 1751606040327,
    "opening_price": 3518000,
    "high_price": 3542000,
    "low_price": 3495000,
    "trade_price": 3510000,
    "prev_closing_price": 3517000,
    "change": "FALL",
    "change_price": 7000,
    "change_rate": 0.0019903327,
    "signed_change_price": -7000,
    "signed_change_rate": -0.0019903327,
    "trade_volume": 0.00712453,
    "acc_trade_price": 20633572185.68442,
    "acc_trade_price_24h": 111690309851.79362,
    "acc_trade_volume": 5871.4585559,
    "acc_trade_volume_24h": 31689.60167858,
    "highest_52_week_price": 5900000,
    "highest_52_week_date": "2024-12-16",
    "lowest_52_week_price": 2096000,
    "lowest_52_week_date": "2025-04-09",
    "timestamp": 1751606040373
  }
]
```

# **계정 잔고 조회**

**get**https://api.upbit.com/v1/accounts

계정이 보유하고 있는 자산 목록과 잔고를 조회합니다.

```jsx
import os
import uuid
import jwt
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.upbit.com"
PATH = "/v1/accounts"

ACCESS_KEY = os.environ["UPBIT_OPEN_API_ACCESS_KEY"]
SECRET_KEY = os.environ["UPBIT_OPEN_API_SECRET_KEY"]

payload = {
  "access_key": ACCESS_KEY,
  "nonce": str(uuid.uuid4()),
}

jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

headers = {
  "Authorization": f"Bearer {jwt_token}",
  "Accept": "application/json",
}

res = requests.get(f"{BASE_URL}{PATH}", headers=headers)
print(res.json())

```

```jsx
[
  {
    "currency": "KRW",
    "balance": "1000000.0",
    "locked": "0.0",
    "avg_buy_price": "0",
    "avg_buy_price_modified": false,
    "unit_currency": "KRW"
  },
  {
    "currency": "BTC",
    "balance": "2.0",
    "locked": "0.0",
    "avg_buy_price": "140000000",
    "avg_buy_price_modified": false,
    "unit_currency": "KRW"
  }
]
```