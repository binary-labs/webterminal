import * as terminal from './terminal.js'
import * as port from './port.js'

const termElement = document.getElementById('terminal');
const portBtn = document.getElementById('portBtn');
const portLabel = document.getElementById('portLabel');
const connectBtn = document.getElementById('connectBtn');
const connectLabel = document.getElementById('connectLabel');


document.addEventListener('DOMContentLoaded', () => {

    terminal.create(termElement);
    terminal.setReadCallback(writeDispatch);

    portBtn.addEventListener('click', change_port);

    start_default();

});

async function start_default() {
    await port.init();
    try {
        start();
    }
    catch (e) {
        console.log(e);
    }
}

async function change_port() {
    await port.select();
    start();
}

function update_port_display()
{
    let text = "No device selected";
    try {
        let info = port.getInfo();
        text = "Device " + info.usbVendorId.toString(16).padStart(4, '0') + ":" + info.usbProductId.toString(16).padStart(4, '0');
    } catch (e) {
        console.log("Cannot print device id");
    }
    portLabel.innerText = text;
}

function update_connection_status(val)
{
    if (val) {
        terminal.log("Device Connected");
        connectLabel.innerText = "Connected";
    }
    else {
        terminal.log("Device Disconnected");
        connectLabel.innerText = "Not Connected";
    }
}


/////////////////////

function writeDispatch(data)
{
    console.log(data);

    if (writeCallback)
    {
        writeCallback(data);
    }
}

let writeCallback;

//////////////////////

let worker;
let reader;
let keepRunning;


function start()
{
    keepRunning = true;
    worker = run();
}

async function stop()
{
    keepRunning = false;
    if (reader) reader.cancel();
    await worker;
}


async function run()
{
    try
    {
        const p = await port.open();

        navigator.serial.addEventListener("connect", (event) => {
            console.log("Connected CB");
        });
        
        navigator.serial.addEventListener("disconnect", (event) => {
            console.log("Disconnected CB");
        });

        console.log("port opened");

        const encoder = new TextEncoderStream();
        const write_stream_closed = encoder.readable.pipeTo(p.writable);

        const decoder = new TextDecoderStream();
        const read_stream_closed = p.readable.pipeTo(decoder.writable);

        update_port_display();    

        while (p.readable && p.writable && keepRunning)
        {
            console.log("Create writer and reader");

            let writer = encoder.writable.getWriter();
            reader = decoder.readable.getReader();

            writeCallback = data => { writer.write(data) };

            update_connection_status(true);

            try
            {
                while (true)
                {
                    console.log("Read");

                    const { value, done } = await reader.read();

                    if (done)
                    {
                        break;
                    }
                    if (value)
                    {
                        terminal.write(value);
                    }
                }
            } catch(readError)
            {
                console.log("Non fatal error: " + readError);
            } finally
            {
                console.log("Close streams");

                writeCallback = data => {};

                reader.releaseLock();
                writer.close();
            }
        }

        console.log("Write loop ended");
        

        await write_stream_closed;
        await read_stream_closed;

        console.log("Closing port");

        await p.close();

        console.log("Port closed");    

        update_connection_status(false);
    }
    catch (e)
    {
        console.log("Caught");
    }
}