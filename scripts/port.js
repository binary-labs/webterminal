
let encoder;
let decoder;
let write_stream;
let read_stream;

let current_port;

export { init, select, open, getInfo };

async function init()
{
    if (!("serial" in navigator))
    {
        console.log("Error");
        alert("Browser has no webserial support");
    }

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
    console.log("Opening port", current_port);

    await current_port.open({ baudRate: 115200 });

    return current_port;
}

