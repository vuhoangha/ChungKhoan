agGrid.initialiseAgGridWithAngular1(angular);
var module = angular.module('chungkhoan', ['agGrid']);



//lấy dữ liệu từ file JSON
var value = new Array();
var xml = new XMLHttpRequest();
xml.open("GET", "./data.json", false);
xml.send(null);
var json = JSON.parse(xml.responseText);

//lưu dữ liệu gốc ban đầu
for (var i = 0; i < json.length; i++) {
    value[i] = new Array();
    for (var n in json[i]) {
        value[i][n] = json[i][n];
    }
}


//lưu giá trị khi chạy web
var valueRun = new Array();
var numValue = value.length;

for (var i = 0; i < value.length; i++) {
    valueRun[i] = new Array();
    valueRun[i]['sell'] = value[i]['sell'];
    valueRun[i]['buy'] = value[i]['buy'];
    valueRun[i]['currency'] = value[i]['currency'];
    valueRun[i]['rate'] = 0;
    valueRun[i]['max'] = value[i]['buy'];
    valueRun[i]['min'] = value[i]['sell'];
    valueRun[i]['isChange'] = 0;
    valueRun[i]['wasChange'] = 0;
}




module.controller('chungkhoanCtrl', function ($scope, $http) {
    var count = 0;

    var columnDefs = [

        {
            headerName: 'Currency'
            , field: 'currency'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">Currency</div>'
            , cellStyle: function () {
                return {
                    'font-weight': 'bold'
                    , 'color': '#25b'
                    , 'font-size': '105%'
                };
            }
            , cellHeight: 60
            , width: 120
            , cellClass: 'centerAlign'
		},

        {
            headerName: 'Sell'
            , field: 'sell'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">Sell</div>'
            , width: 120
            , valueGetter: valueSell
            , cellClass: 'centerAlign'
		},

        {
            headerName: 'Buy'
            , field: 'buy'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">Buy</div>'
            , width: 120
            , valueGetter: valueBuy
            , cellClass: 'centerAlign'
		},

        {
            headerName: ''
            , field: 'icon'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;"></div>'
            , valueGetter: valueIcon
            , cellClass: 'centerAlign'
            , width: 40
		},

        {
            headerName: 'Change'
            , field: 'change'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">Change</div>'
            , width: 120
            , valueGetter: valueChange
            , cellClass: 'centerAlign'
		},

        {
            headerName: 'High'
            , field: 'high'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">High</div>'
            , width: 120
            , valueGetter: valueMax
            , cellClass: 'centerAlign'
		},

        {
            headerName: 'Low'
            , field: 'low'
            , headerCellTemplate: '<div style="line-height:25px; text-align:center; font-weight:Bold; border:none;">Low</div>'
            , width: 120
            , valueGetter: valueMin
            , cellClass: 'centerAlign'
		}

	];


    //lặp lại sau một khoảng thời gian
    var updatedNode = new Array(); //update lại những hàng thay đổi
    var updatedNode_ = new Array(); //update lại những hàng mà trong lần trước đã thay đổi còn lần này giữ nguyên
    var timeDelay = 3000
        , startTime = 0;
    setInterval(function () {

        startTime = new Date().getTime();

        count = 0;
        while (count < numValue) {
            createRate();
            count++;
        }

        count = 0;
        updatedNode = [];
        updatedNode_ = [];
        $scope.gridOptions.api.forEachNode(function (node) {

            if (valueRun[count]['isChange'] != 0) {
                updatedNode.push(node);
                $scope.gridOptions.api.refreshCells(updatedNode, ['sell']);
                $scope.gridOptions.api.refreshCells(updatedNode, ['buy']);
                $scope.gridOptions.api.refreshCells(updatedNode, ['icon']);
                $scope.gridOptions.api.refreshCells(updatedNode, ['change']);
                $scope.gridOptions.api.refreshCells(updatedNode, ['high']);
                $scope.gridOptions.api.refreshCells(updatedNode, ['low']);
                updatedNode = [];
            } else {
                if (valueRun[count]['wasChange'] != 0) {
                    updatedNode_.push(node);
                    $scope.gridOptions.api.refreshCells(updatedNode_, ['sell']);
                    $scope.gridOptions.api.refreshCells(updatedNode_, ['buy']);
                    $scope.gridOptions.api.refreshCells(updatedNode_, ['icon']);
                    updatedNode_ = [];
                }
            }
            count++;

        });

        timeDelay = new Date().getTime() - startTime;

    }, timeDelay);


    //tính tỉ lệ tăng hoặc giảm ngẫu nhiên
    var rate = result = isChange = 0;;

    function createRate() {

        valueRun[count]['wasChange'] = valueRun[count]['isChange'];

        //tạo ra tỉ lệ ngẫu nhiên với 25% là sẽ thay đổi
        if (Math.floor((Math.random() * 4) + 0) != 0) {

            valueRun[count]['isChange'] = 0;
            return;

        } else {

            rate = Math.floor((Math.random() * 100) + 0);
            rate = rate / 100;
            rate = rate + Math.floor((Math.random() * 5) + 0);
            rate = (rate).toFixed(2);
            if (Math.floor((Math.random() * 2) + 0) == 0) {
                rate = rate * -1;
            }

            //xem no co thay doi
            if (valueRun[count]['rate'] > rate) {
                valueRun[count]['isChange'] = -1;
            } else if (valueRun[count]['rate'] < rate) {
                valueRun[count]['isChange'] = 1;
            } else {
                valueRun[count]['isChange'] = 0;
            }

            valueRun[count]['rate'] = rate;
        }

    }

    //trả giá trị cho cột SELL
    var countIndex = 0;

    function valueSell(params) {

        //xác định chỉ số của hàng cần trả giá trị về
        for (var i = 0; i < valueRun.length; i++) {

            if (valueRun[i]['currency'] == params.data.currency) {
                {

                    countIndex = i;
                    break;

                }
            }

        }

        //nếu hàng này ko đổi so với giá trị cũ thì return lại giá trị cũ
        if (valueRun[countIndex]['isChange'] == 0) {
            return '<button type="button" class="btn btn-default buttonUser">' + valueRun[countIndex]['sell'] + '</button>';
        }

        //tính toán giá trị trả về theo tỉ lệ thay đổi đã tính ở trên
        result = value[countIndex]['sell'] * valueRun[countIndex]['rate'];
        result /= 100;
        result += value[countIndex]['sell'];
        result = (result).toFixed(params.data.round);

        //lưu lại giá trị này cho lần kế tiếp
        valueRun[countIndex]['sell'] = result;

        //xét giá trị nhỏ nhất ( LOW )
        if (valueRun[countIndex]['min'] > result) {
            valueRun[countIndex]['min'] = result;
        }

        if (valueRun[countIndex]['isChange'] > 0) //nếu giá trị tăng so với giá trị cũ thì icon sẽ tăng và màu chữ xanh
            return '<button type="button" class="btn btn-default buttonUser up buttonUpDown">' + result + '</button>';
        else if (valueRun[countIndex]['isChange'] < 0) //nếu giá trị giảm so với giá trị cũ icon giảm và màu chữ đỏ
            return '<button type="button" class="btn btn-default buttonUser down buttonUpDown">' + result + '</button>';

    }

    //trả giá trị cho cột BUY
    function valueBuy(params) {

        //nếu giá trị ko đổi so với giá trị cũ thì trả về giá trị cũ
        if (valueRun[countIndex]['isChange'] == 0) {
            return '<button type="button" class="btn btn-default buttonUser">' + valueRun[countIndex]['buy'] + '</button>';
        }

        //tính toán giá trị mới theo tỉ lệ thay đổi đã tính ở trên
        result = value[countIndex]['buy'] * valueRun[countIndex]['rate'];
        result /= 100;
        result += value[countIndex]['buy'];
        result = (result).toFixed(params.data.round);

        //lưu lại giá trị vừa tính toán
        valueRun[countIndex]['buy'] = result;

        //so sánh để tìm giá trị lớn nhất ( HIGH )
        if (valueRun[countIndex]['max'] < result) {
            valueRun[countIndex]['max'] = result;
        }

        if (valueRun[countIndex]['isChange'] == 1) //nếu giá trị tăng so với giá trị cũ
            return '<button type="button" class="btn btn-default buttonUser up buttonUpDown">' + result + '</button>';
        else if (valueRun[countIndex]['isChange'] == -1) //nếu giá trị giảm so với giá trị cũ
            return '<button type="button" class="btn btn-default buttonUser down buttonUpDown">' + result + '</button>';
    }

    //trả về tỉ lệ thay đổi đã tính toán ở trên
    function valueChange() {
        return valueRun[countIndex]['rate'] + '%';
    }

    //trả về giá trị HIGH
    function valueMax() {
        return valueRun[countIndex]['max'];
    }

    //trả về giá trị LOW
    function valueMin() {
        return valueRun[countIndex]['min'];
    }

    //trả về kiểu icon sẽ hiển thị
    function valueIcon() {

        if (valueRun[countIndex]['isChange'] == 1) //nếu giá trị tăng so với giá trị cũ
            return '<i class="glyphicon glyphicon-triangle-top up"></i>';
        else if (valueRun[countIndex]['isChange'] == -1) //nếu giá trị giảm
            return '<i class="glyphicon glyphicon-triangle-bottom down"></i>';
        else //nếu giá trị không đổi
            return '';

    }

    $scope.gridOptions = {

        angularCompileRows: true
        , columnDefs: columnDefs
        , rowData: null
        , enableColResize: true
        , getRowHeight: function () {
            return 40;
        }

    };

    $http.get('./data.json').then(function (res) {

        $scope.gridOptions.api.setRowData(res.data);
        $scope.gridOptions.api.sizeColumnsToFit();

    });

});