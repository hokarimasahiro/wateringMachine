input.onLogoEvent(TouchButtonEvent.Touched, function () {
    非表示時間 = input.runningTime() + 2000
    時刻表示()
    かん水()
})
input.onButtonPressed(Button.A, function () {
    かん水間隔 += 1
    if (かん水間隔 > 15) {
        かん水間隔 = 0
    }
    watchfont.showNumber2(かん水間隔)
    非表示時間 = input.runningTime() + 1000
})
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    コマンド処理()
})
function 時刻表示２ () {
    ds3231.getClock()
    watchfont.showSorobanNumber(ds3231.getClockData(clockData.hour), 0, 2)
    watchfont.showSorobanNumber(ds3231.getClockData(clockData.minute), 3, 2)
    if (ds3231.getClockData(clockData.second) % 2 == 0) {
        for (let カウンター = 0; カウンター <= 4; カウンター++) {
            led.unplot(2, カウンター)
        }
    } else {
        if (ds3231.getClockData(clockData.second) < 10) {
            led.plot(2, 1)
            led.plot(2, 3)
        } else {
            led.plot(2, 5 - Math.trunc(ds3231.getClockData(clockData.second) / 10))
        }
    }
}
function コマンド処理 () {
    コマンド = 受信文字.split(",")
    if (コマンド[0] == "s") {
        ds3231.setClockData(clockData.year, parseFloat(コマンド[1]))
        ds3231.setClockData(clockData.month, parseFloat(コマンド[2]))
        ds3231.setClockData(clockData.day, parseFloat(コマンド[3]))
        ds3231.setClockData(clockData.hour, parseFloat(コマンド[4]))
        ds3231.setClockData(clockData.minute, parseFloat(コマンド[5]))
        ds3231.setClockData(clockData.second, parseFloat(コマンド[6]))
        ds3231.setClock()
    }
}
function かん水 () {
    pins.digitalWritePin(DigitalPin.P2, 1)
    basic.pause(かん水時間 * 1000)
    pins.digitalWritePin(DigitalPin.P2, 0)
}
radio.onReceivedString(function (receivedString) {
    受信文字 = receivedString
    コマンド処理()
})
input.onButtonPressed(Button.B, function () {
    かん水時間 += 1
    if (かん水時間 > 9) {
        かん水時間 = 1
    }
    basic.showNumber(かん水時間)
    非表示時間 = input.runningTime() + 1000
})
function アラーム設定 () {
    ds3231.getClock()
    if (かん水間隔 == 0) {
        if (ds3231.getClockData(clockData.hour) >= 7 && ds3231.getClockData(clockData.hour) < 19) {
            ds3231.setAlarm(2, 19, 0)
        } else {
            ds3231.setAlarm(2, 7, 0)
        }
    } else {
        ds3231.setAlarm(2, 7, 0)
    }
}
function 時刻表示 () {
    ds3231.getClock()
    watchfont.showNumber2(ds3231.getClockData(clockData.hour))
    basic.pause(1000)
    watchfont.showNumber2(ds3231.getClockData(clockData.minute))
    basic.pause(500)
}
let コマンド: string[] = []
let 受信文字 = ""
let 非表示時間 = 0
let かん水間隔 = 0
let かん水時間 = 0
ds3231.initDevice()
pins.digitalWritePin(DigitalPin.P2, 0)
pins.digitalWritePin(DigitalPin.P16, 0)
アラーム設定()
serial.redirectToUSB()
radio.setGroup(80)
led.setBrightness(32)
かん水時間 = 3
let コメント = "かん水時間：秒"
かん水間隔 = 0
コメント = "かん水間隔 0:1日2回 1～15:かん水間隔日数"
let かん水待ち日数 = かん水間隔
basic.showIcon(IconNames.SmallHeart)
basic.forever(function () {
    if (非表示時間 <= input.runningTime()) {
        時刻表示２()
    }
    if (ds3231.checkAlarm(2)) {
        かん水待ち日数 += -1
        if (かん水待ち日数 <= 0) {
            かん水待ち日数 = かん水間隔
            ds3231.resetAlarm(2)
            かん水()
            アラーム設定()
        }
    }
    basic.pause(1000)
})
