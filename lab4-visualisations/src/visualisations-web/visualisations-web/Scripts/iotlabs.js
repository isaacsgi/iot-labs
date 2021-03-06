﻿$(function () {

    var heaterOn = false;
    $(".heaterOn").hide();
    $(".heaterOff").fadeIn();

    var energyMonitoringProxy = $.connection.energyMonitorHub;
    energyMonitoringProxy.client.pump = function (readings) {
        //console.log(readings);
        drawEnergyChart(readings);
    };

    var temperatureProxy = $.connection.temperatureHub;
    temperatureProxy.client.pump = function (reading) {
        console.log(reading);
        updateTemperature(reading);
    };

    var heaterProxy = $.connection.heaterHub;
    heaterProxy.client.notifyClient = function (status) {
        console.log(status);
        heaterOn = status.IsTurnedOn;
        if (heaterOn) {
            $(".heaterOff").hide();
            $(".heaterOn").fadeIn();
        }
        else {
            $(".heaterOn").hide();
            $(".heaterOff").fadeIn();
        }
    }

    $.connection.hub.start()
        .done(function () {
            console.log('Now connected, connection ID=' + $.connection.hub.id);
            energyMonitoringProxy.server.startReadingPump()
                .done(function () { console.log('started pump for energy use'); })
                .fail(function (e) { console.error(e) });

            temperatureProxy.server.startReadingPump()
                .done(function () { console.log('started pump for temperature'); })
                .fail(function (e) { console.error(e) });
        })
        .fail(function () { console.log('Could not Connect!'); });

    var drawEnergyChart = function (readings) {
        var categories = new Array(readings.length);
        var series = new Array(1);
        series[0] = { name: 'DeviceId0', data: new Array(readings.length) };
        for (var i = 0; i < readings.length; i++) {
            categories[i] = readings[i].timestamp;
            series[0].data[i] = readings[i].endReading;
        }
        //console.log(series[0].data);

        $('#energyMonitorChart').highcharts({
            title: {
                text: 'Last 10 Energy Readings',
                x: -20 //center
            },
            subtitle: {
            	text: 'DeviceId0',
                x: -20
            },
            xAxis: {
                categories: categories,
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Energy (Kwh)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: 'Kwh'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            plotOptions: {
                series: {
                    animation: false
                }
            },
            series: series
        });
    }

    var updateTemperature = function (temperatureReading)
    {
    	console.log("temp: " + temperatureReading);
        $("#currentTemperature").text(temperatureReading.Temperature.toPrecision(4));
        $("#temperatureUpdated").text(moment(temperatureReading.EndTime).fromNow())
    }

    $('#temperatureChart').highcharts({
        title: {
            text: 'Average Temperatures',
            x: -20 //center
        },
        subtitle: {
            text: 'Device1',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Device1',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'Device2',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'Device3',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'Device4',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });
    
});