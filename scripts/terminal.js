import '../lib/xterm/lib/xterm.js';
import '../lib/xterm-addon-fit/lib/xterm-addon-fit.js';

export {create, write, log, setReadCallback};

let term;
let fitAddon;

function create(term_element)
{
    var baseTheme = {
        foreground: '#F8F8F8',
        background: '#2D2E2C',
        selection: '#5DA5D533',
        black: '#1E1E1D',
        brightBlack: '#262625',
        red: '#CE5C5C',
        brightRed: '#FF7272',
        green: '#5BCC5B',
        brightGreen: '#72FF72',
        yellow: '#CCCC5B',
        brightYellow: '#FFFF72',
        blue: '#5D5DD3',
        brightBlue: '#7279FF',
        magenta: '#BC5ED1',
        brightMagenta: '#E572FF',
        cyan: '#5DA5D5',
        brightCyan: '#72F0FF',
        white: '#F8F8F8',
        brightWhite: '#FFFFFF'
      };

    term = new Terminal({
        fontFamily: 'monospace',
        theme: baseTheme,
        cursorBlink: true,
        rows: 30
        
    });
    fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    term.open(term_element);
    fitAddon.fit();

    window.onresize = function () {
        fitAddon.fit();
        console.log(JSON.stringify({ cols: term.cols, rows: term.rows }));
      }

    log("Terminal loaded");
}

function write(value)
{
    let corrected_value = value.replace(/(?:\\[n]|[\n])/g,"\n\r")
    term.write(corrected_value)
}

function setReadCallback(cb)
{
    term.onData(cb);
}

function log(value)
{
    term.write("\x1B[1;31m" + value + "\x1B[0m" + "\r\n");
}


