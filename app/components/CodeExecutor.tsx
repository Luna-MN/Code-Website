'use client';

import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';

const CodeExecutor: React.FC = () => {
    const [code, setCode] = useState<string>(''); // Python code input
    const [output, setOutput] = useState<string>(''); // Output of execution
    const [pyodide, setPyodide] = useState<any>(null); // Pyodide instance

    useEffect(() => {
        const loadPyodide = async () => {
            try {
                console.log('Loading Pyodide...');
                const pyodideInstance = await (window as any).loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.0/full/',
                });
                console.log('Pyodide loaded successfully.');

                // Redirect standard output
                pyodideInstance.runPython(`
                    import sys
                    from io import StringIO
                    sys.stdout = StringIO()
                    sys.stderr = StringIO()
                `);

                setPyodide(pyodideInstance);
            } catch (error) {
                console.error('Failed to load Pyodide:', error);
            }
        };

        if (!(window as any).loadPyodide) {
            const script = document.createElement('script');
            script.src =
                'https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js';
            script.onload = loadPyodide;
            script.onerror = () => {
                console.error('Failed to load Pyodide script');
            };
            document.body.appendChild(script);
        } else {
            loadPyodide();
        }
    }, []);

    const executeCode = async () => {
        if (!pyodide) {
            setOutput('Pyodide is still loading or failed to load.');
            return;
        }
        try {
            console.log('Executing code:', code);

            // Run the Python code
            await pyodide.runPythonAsync(code);

            // Capture stdout and stderr
            const stdout = pyodide.runPython('sys.stdout.getvalue()');
            const stderr = pyodide.runPython('sys.stderr.getvalue()');

            setOutput(stdout || stderr || 'No output');
        } catch (error) {
            console.error('Error running code:', error);
            setOutput(`Error: ${String(error)}`);
        }
    };

    return (
        <div>
            <h1>Python Code Executor</h1>
            <CodeMirror
                value={code}
                options={{
                    mode: 'python',
                    theme: 'material',
                    lineNumbers: true,
                }}
                onBeforeChange={(editor, data, value) => {
                    setCode(value);
                }}
            />
            <button onClick={executeCode}>Run Code</button>
            <pre>{output}</pre>
        </div>
    );
};

export default CodeExecutor;
