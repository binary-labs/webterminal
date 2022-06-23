import * as terminal from './terminal.js'
import * as port from './port.js'

const termElement = document.getElementById('terminal');
const portBtn = document.getElementById('portBtn');
const portLabel = document.getElementById('portLabel');
const connectBtn = document.getElementById('connectBtn');
const connectLabel = document.getElementById('connectLabel');


document.addEventListener('DOMContentLoaded', () => {
    
  terminal.create(termElement);

  portBtn.addEventListener('click', change_port);

  start_default(); 

});

async function start_default()
{
  await port.init();
  update_port_display();
  try
  {
    await start();
  }
  catch (e)
  {
    console.log(e);
  }  
}

async function change_port()
{
  await port.select();
  update_port_display();
  await start();
}

function update_port_display()
{
  let text = "No device selected";
  try
  {
    let info = port.getInfo();
    text = "Device " + info.usbVendorId.toString(16).padStart(4, '0') + ":" + info.usbProductId.toString(16).padStart(4, '0');
  } catch(e)
  {
   console.log("Cannot print device id");
  }
  portLabel.innerText = text;  
}

function update_connection_status(val)
{
  if (val)
  {
    terminal.log("Device Connected");
    connectLabel.innerText = "Connected";
  }
  else
  {
    terminal.log("Device Disconnected");
    connectLabel.innerText = "Not Connected";
  }
}


/////////////////////

let ac;
let done;

async function start()
{

  let {read_stream, write_stream} = await port.open();

  let reader = read_stream.getReader();
  let writer = write_stream.getWriter();

  ac = new AbortController();
  done = new Promise(async (resolve, reject) =>
  {
    terminal.setReadCallback(data => {writer.write(data)});

    while (true)
    {
        try{
          const { value, done } = await reader.read({signal: ac.signal});

          if (value)
          {
            terminal.write(value);
          }

          if (done)
          {
              break;
          }
        } catch(e)
        {
          if (e.name !== 'AbortError') 
          {
            reject(e);
          }
          else
          {
            console.log("Aborting loop");            
          }        
        }
    }
    
    reader.releaseLock();
    resolve(true);
  });

  console.log("started");

  update_connection_status(true);

}

// Todo: stopping does not work yet
async function signal_stop()
{
  console.log("Stopping");
  ac.abort();
  await done;

  update_connection_status(false);
}