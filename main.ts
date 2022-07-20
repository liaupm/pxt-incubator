/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

 //A1 conectothermistor -> programo A1

//A0 conecto heat -> programo A0
//A14 conecto canal con 2 ventis -> programo A2
//A13 conecto 1 venti  -> programo A3
//A11 conecto 1 venti  -> programo A4

enum humidity_times {
    //% block="6 hours"
    sixhours,
    //% block="12 hours"
    twelvehours,
    //% block="18 hours"
    eighteenhours,
    //% block="24 hours"
    twentyfourhours
}

enum the_temp {
    //% block="35ºC"
    thirtyfive,
    //% block="36ºC"
    thirtysix,
    //% block="37ºC"
    thirtyseven,
}

enum incubator_preparation {
    //% block="manual"
    manual,
    //% block="automatic"
    automatic,
}




// 6x8 font
const Font_5x7 = hex`000000000000005F00000007000700147F147F14242A072A12231308646237495522500005030000001C2241000041221C00082A1C2A0808083E080800503000000808080808006060000020100804023E5149453E00427F400042615149462141454B311814127F1027454545393C4A49493001710905033649494936064949291E003636000000563600000008142241141414141441221408000201510906324979413E7E1111117E7F494949363E414141227F4141221C7F494949417F090901013E414151327F0808087F00417F41002040413F017F081422417F404040407F0204027F7F0408107F3E4141413E7F090909063E4151215E7F09192946464949493101017F01013F4040403F1F2040201F7F2018207F63140814630304780403615149454300007F4141020408102041417F000004020102044040404040000102040020545454787F484444383844444420384444487F3854545418087E090102081454543C7F0804047800447D40002040443D00007F10284400417F40007C041804787C0804047838444444387C14141408081414187C7C080404084854545420043F4440203C4040207C1C2040201C3C4030403C44281028440C5050503C4464544C44000836410000007F000000413608000201020402`

//% weight=100 color=#AA278D icon="\uf769"
namespace incubator { //mi icono de PCR en el desplegable

 const MAX_X = 127
 let _I2CAddr = 60
 let _screen = pins.createBuffer(1025)
 let _buf3 = pins.createBuffer(3)
 let _buf4 = pins.createBuffer(4)
 let _buf7 = pins.createBuffer(7)
 _buf7[0] = 0x40
 
 function cmd1(d: number) {
    let n = d % 256;
    pins.i2cWriteNumber(_I2CAddr, n, NumberFormat.UInt16BE);
 }
 
 function cmd2(d1: number, d2: number) {
    _buf3[0] = 0;
    _buf3[1] = d1;
    _buf3[2] = d2;
    pins.i2cWriteBuffer(_I2CAddr, _buf3);
 }
 
 function cmd3(d1: number, d2: number, d3: number) {
    _buf4[0] = 0;
    _buf4[1] = d1;
    _buf4[2] = d2;
    _buf4[3] = d3;
    pins.i2cWriteBuffer(_I2CAddr, _buf4);
 }
 
 function set_pos(col: number = 0, page: number = 0) {
    cmd1(0xb0 | page) // page number
    cmd1(0x00 | (col % 16)) // lower start column address
    cmd1(0x10 | (col >> 4)) // upper start column address    
 }

 //draw refresh screen
 function draw(d: number) {
    if (d > 0) {
        set_pos()
        pins.i2cWriteBuffer(_I2CAddr, _screen)
    }
 }
 
 function char(c: string, col: number, row: number, color: number = 1) {
    let p = (Math.min(127, Math.max(c.charCodeAt(0), 32)) - 32) * 5
    let ind = col + row * 128 + 1
 
    for (let i = 0; i < 5; i++) {
        _screen[ind + i] = (color > 0) ? Font_5x7[p + i] : Font_5x7[p + i] ^ 0xFF
        _buf7[i + 1] = _screen[ind + i]
    }
    _screen[ind + 5] = (color > 0) ? 0 : 0xFF
    _buf7[6] = _screen[ind + 5]
    set_pos(col, row)
    pins.i2cWriteBuffer(_I2CAddr, _buf7)
 }
 
 /*show text in OLED"show string %s|at col %col|row %row|color %color"*/ 
 export function String(s: string, col: number, row: number, color: number = 1) {
    for (let n = 0; n < s.length; n++) {
        char(s.charAt(n), col, row, color) //row goes from 0-7 ; column goes from 0-150
        col += 6
        if (col > (MAX_X - 6)) return
    }
 }
 
 /**
 * show a number in OLED*/
 export function Number(num: number, col: number, row: number, color: number = 1) {
    String(num.toString(), col, row, color) //row goes from 0-7 ; column goes from 0-150
 }
 
 /**
 * clear screen
 */
 
 export function clear() {
    //_cx = _cy = 0
    _screen.fill(0)
    _screen[0] = 0x40
    draw(1)
 }
 
 /**
 * OLED initialize
 */
 export function init() {
    cmd1(0xAE)       // SSD1306_DISPLAYOFF
    cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
    cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
    cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
    cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
    cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
    cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
    cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
    cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
    cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
    cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
    cmd1(0xc8)       // SSD1306_COMSCANDEC
    cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
    cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
    cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
    cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
    cmd1(0xA6)       // SSD1306_NORMALDISPLAY
    cmd2(0xD6, 0)    // zoom off ->->->->->->->->->->->->->->->-> igual si pongo 1 me salen mas grandes los pixels
    cmd1(0xAF)       // SSD1306_DISPLAYON
    clear()
 }
 init();
 //////// HASTA AQUI HE CREADO TODAS LAS FUNCIONES QUE VOY A USAR EN MI OLED

 //block scope es todo lo que va entre {} por ejemplo un if,for y while{} son en si mismos un block scope
    // var: globally or function scoped and can be redeclared and reupdated. 
    //let (updated) y const (no updated): block scoped
 // voy a declarar las variables con LET aqui y despues solo las reupdate NO redeclare


 

let cont: number=0;
let cont2: number=0;
let bol: number=0;
let t: number=0;
let t_saved: number=0;
let increase: number=0;
let increase_test: number=0;
let t_obj: number=38;
let thetime: number=0;
let start: number=0;
let totalmillis: number=0;
let themillis: number=0;
let t1: number=0;
let t2: number=0;
let bool1: number=0;


function  leersensor(): number{
    //initialize

    let dataPin: number=7; //pin al que esta concectado el sensor
    let DHT: DHTtype=DHT22; //tipo de sensor
    
    let pullUp: number=0;
    let serialOtput: number=1;//que la pantalla lea
    let wait: number=1//esperar tiempo entre mediciones
    let checksum: number = 0;
    let checksumTmp: number = 0;
    let dataArray: number[] = [];
    let resultArray: number[] = [];

    for (let index = 0; index < 40; index++) dataArray.push(0);
    for (let index = 0; index < 5; index++) resultArray.push(0);

    let _humidity: number = -999.0;
    let _temperature: number = -999.0;
    let _readSuccessful: number = 0;
    let _sensorresponding: number = 0;


    //request data
    pins.digitalWritePin(dataPin, 0); //begin protocol, pull down pin
    basic.pause(18);
    
    if (pullUp==1) pins.setPull(dataPin, PinPullMode.PullUp); //pull up data pin if needed
    pins.digitalReadPin(dataPin); //pull up pin
    control.waitMicros(40);
    
    if (pins.digitalReadPin(dataPin) == 1) {
        if (serialOtput==1) {
            //codigo de la pantalla
                  //////TEXT ver si funciona el sensor
                    String(" Sensor",40,2,1); //meter un espacio antes de la "S"
                    String(" Error ",40,4,1);
                    pause(1000); //give time for OLED to initialize
                    clear(); //borro todo por si acaso
        }

    } else {

        _sensorresponding = 1;

        while (pins.digitalReadPin(dataPin) == 0); //sensor response
        while (pins.digitalReadPin(dataPin) == 1); //sensor response

        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            control.waitMicros(28);
            //if sensor still pull up data pin after 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = 1;
        }

        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3];
        checksum = resultArray[4];
        if (checksumTmp >= 512) checksumTmp -= 512;
        if (checksumTmp >= 256) checksumTmp -= 256;
        if (checksum == checksumTmp) _readSuccessful = 1;

        //read data if checksum ok
        if (_readSuccessful==1) {
      
                //DHT22
                let temp_sign: number = 1;
                if (resultArray[2] >= 128) {
                    resultArray[2] -= 128;
                    temp_sign = -1;
                }
                _humidity = (resultArray[0] * 256 + resultArray[1]) / 10;
                _temperature = (resultArray[2] * 256 + resultArray[3]) / 10 * temp_sign;
                _humidity=Math.round(_humidity * 100) / 100; //2 decimales en pantalla
                _temperature=Math.round(_temperature * 100) / 100;
            
        }

        //serial output
        if (serialOtput==1) {
            if (_readSuccessful==1) {
                   //DISPLAY TEMPERATURE ON SCREEN:
                String(" Temperature: ",20,2,1); //meter un espacio antes de la "S"
                Number(_temperature,20,4,1);
                String(" *C ",60,4,1); //meter un espacio antes de la "S"
                Number(_humidity,15,6,1);
                String(" Humidity ",60,6,1); //meter un espacio antes de la "S"
                pause(500);
                clear();
             
            } else {
                String(" Screen Error ",20,2,1);
            }
        }

    }

    //wait 2 sec 
    if (wait==1) basic.pause(1000);
    return _temperature
}



 function timeselection(usertime:humidity_times):void{
    switch(usertime) { 
        case humidity_times.sixhours: thetime=6*60*60000;break; //fifteenseconds=15000ms
        case humidity_times.twelvehours: thetime=12*60*60000;break; //fifteenseconds=15000ms
        case humidity_times.eighteenhours: thetime=18*60*60000;break; //fifteenseconds=15000ms
        case humidity_times.twentyfourhours: thetime=24*60*60000;break; //fifteenseconds=15000ms
    }
}//close f(x) timeselection


function incubate_mode(themode:incubator_preparation):void{
    switch(themode) { 
        case incubator_preparation.automatic: bool1=1;break; 
        case incubator_preparation.manual: bool1=0;break; 
    }
}//close f(x) timeselection


function incubate_temp(thetemp:the_temp):void{
    switch(thetemp) { 
        case the_temp.thirtyfive: t_obj=35;break; //fifteenseconds=15000ms
        case the_temp.thirtysix: t_obj=36;break; //fifteenseconds=15000ms
        case the_temp.thirtyseven: t_obj=37;break; //fifteenseconds=15000ms
    }
}//close incubate_temp



//% block="Prepare incubator in %value mode" blockGap=8
//% weight=100 color=#FFA533
export function Prepare_incubator(value: incubator_preparation): void {
    incubate_mode(value);
    if (bool1==1){
            if (cont==0){
                    String(" Please wait",40,2,1);
                    String(" 15 minutes",40,4,1);
                    pause(1000); //give time for OLED to initialize
                    clear(); //borro todo por si acaso
                    cont=cont+1;
                }


                String(" FILLING EVAPORATION",40,2,1);
                String(" TANK",40,4,1);
                pause(1000); //give time for OLED to initialize
                pins.D11.digitalWrite(false)
                pause(900000)
                pins.D11.digitalWrite(true)
                clear(); //borro todo por si acaso
                String(" FULL TANK",40,2,1);
                clear();
    }
    else{
        String(" Please",40,2,1);
        String(" fill the tank",40,4,1);
        pause(1000); //give time for OLED to initialize
        pause(900000);
        clear(); //borro todo por si acaso
    }
    String(" THE TANK",40,2,1);
    String(" IS READY",40,4,1);
    pause(1000); //give time for OLED to initialize
    clear();

}

//% block="Start incubator at %value" blockGap=8
//% weight=100 color=#FFA533
export function Start_incubator(value: the_temp): void {
        incubate_temp(value);
        //////TEXT START PCR
        String(" START INCUBATOR",40,2,1); //meter un espacio antes de la "S"
        String("Heating to ",40,4,1);
        Number(t_obj,20,6,1);
        pause(1000); //give time for OLED to initialize
        clear(); //borro todo por si acaso


        // Initial startup for incubator temperature
        while (bol==0){
            let _temperature=leersensor();
            if (_temperature<(t_obj-2)){
                pins.D11.digitalWrite(false);
            }
            if (_temperature>=(t_obj-2)){
                pins.D11.digitalWrite(true)
                if (_temperature>(t_obj+0.2)){
                t_saved=_temperature;
                bol=bol+1;
                    String(" Temperature reached",40,2,1);
                    }
            }
        }
    }
        



//% block="Incubate and open valve every %time" blockGap=8
//% weight=90 color=#AA278D
export function incubation(time: humidity_times): void {
 
 String(" INCUBATING",40,2,1); //meter un espacio antes de la "S"
 
    timeselection(time); 
    // See if temperature increases or decreases
    // increase>0 --> Increasing temperature
    // increase<0 --> Decreasing temperature

    let _temperature=leersensor();
    increase_test=t_saved-_temperature;
    if (increase_test!=0){
        increase=increase_test;
        t_saved=_temperature;
    }


    if (_temperature<=t_obj+0.2){
        if (increase<0){
        pins.D11.digitalWrite(false);
        }
    }
    if (_temperature<=t_obj-1.5){
        if (increase>0){
            pins.D11.digitalWrite(true);
        }
    }

  if (cont2==0){
        t1=control.millis();
        t2=control.millis();
        cont2=cont2+1;
    }

    t2=control.millis();
    t=t2-t1;
      

    if (t>=thetime){
        t2=t1;
        start=control.millis();
        while (totalmillis<=60000){
            String(" FILLING THANK",40,2,1)
            pins.D9.digitalWrite(false);
            let _temperature=leersensor();
            themillis=control.millis()-start;
            totalmillis=themillis+totalmillis;
        }
        totalmillis=0;
        pins.D9.digitalWrite(true);
      }

}

 
} //close namespace 
