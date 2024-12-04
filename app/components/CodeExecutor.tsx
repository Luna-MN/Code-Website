'use client';

import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Select from 'react-select';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/ruby/ruby';

const CodeExecutor: React.FC = () => {
    const [code, setCode] = useState<string>(''); // Code input
    const [output, setOutput] = useState<string>(''); // Output of execution
    const [pyodide, setPyodide] = useState<any>(null); // Pyodide instance
    const [language, setLanguage] = useState<string>('python'); // Selected language

    const languageOptions = [
        { value: 'python', label: 'Python' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'ruby', label: 'Ruby' },
    ];

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
                console.error('Failed to load Pyodide script.');
            };
            document.body.appendChild(script);
        } else {
            loadPyodide();
        }
    }, []);

    const handleLanguageChange = (selectedOption: any) => {
        setLanguage(selectedOption.value);
    };

    const executeCode = async () => {
        if (language === 'python' && pyodide) {
            try {
                pyodide.runPython(code);
                const output = pyodide.runPython('sys.stdout.getvalue()');
                setOutput(output);
            } catch (error) {
                setOutput((error as Error).toString());
            }
        } else if (language === 'javascript') {
            try {
                const originalConsoleLog = console.log;
                let consoleOutput = '';
                console.log = (message: any) => {
                    consoleOutput += message + '\n';
                };

                const func = new Function(code);
                func();

                console.log = originalConsoleLog;
                setOutput(consoleOutput);
            } catch (error) {
                setOutput((error as Error).toString());
            }
        } else if (language === 'ruby') {
            setOutput('Ruby execution is not supported.');
        }
    };

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'black',
            color: 'white',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: 'black',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'gray' : 'black',
            color: 'white',
            '&:hover': {
                backgroundColor: 'gray',
            },
        }),
    };

    return (
        <div>
            <Select
                value={languageOptions.find(
                    (option) => option.value === language
                )}
                onChange={handleLanguageChange}
                options={languageOptions}
                styles={customStyles}
            />
            <CodeMirror
                value={code}
                options={{
                    mode: language,
                    theme: 'material',
                    lineNumbers: true,
                }}
                onBeforeChange={(editor, data, value) => {
                    setCode(value);
                }}
            />
            <button onClick={executeCode}>Run</button>
            <pre>{output}</pre>
        </div>
    );
};

export default CodeExecutor;
