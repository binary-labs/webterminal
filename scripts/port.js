
let encoder;
let decoder;
let write_stream;
let read_stream;

let current_port;

export { init, select, open, getInfo };

async function init()
{
    let available_ports = await navigator.serial.getPorts();
    if (available_ports && available_ports.length == 1)
    {
        current_port = available_ports[0];
        console.log("Found default port");
    }
}

async function select()
{
    current_port = await navigator.serial.requestPort();
}

function getInfo()
{
    if (current_port)
    {
        return current_port.getInfo();
    }
}

async function open()
{
    try
    {
        console.log("Closing");
        await current_port.close();
        console.log("Closed", current_port);
    } catch (e)
    {      
        console.log("Closing failed");      
    }

    console.log("Opening port", current_port);

    await current_port.open({ baudRate: 115200 });

    encoder = new TextEncoderStream();
    let output_done = encoder.readable.pipeTo(current_port.writable);
    write_stream = encoder.writable;

    decoder = new TextDecoderStream();
    let input_done = current_port.readable.pipeTo(decoder.writable);
    read_stream = decoder.readable

    return {read_stream, write_stream};

}

