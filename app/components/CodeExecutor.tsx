'use client';

import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Select from 'react-select';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/clike/clike';

import styles from './CodeExecutor.module.css';

const CodeExecutor: React.FC = () => {
    const [code, setCode] = useState<string>(''); // Code input
    const [output, setOutput] = useState<string>(''); // Output of execution
    const [language, setLanguage] = useState<string>('python'); // Selected language

    const languageOptions = [
        { value: 'python', label: 'Python', id: 71 },
        { value: 'javascript', label: 'JavaScript', id: 63 },
        { value: 'ruby', label: 'Ruby', id: 72 },
        { value: 'csharp', label: 'C#', id: 51 },
    ];

    const handleLanguageChange = (selectedOption: any) => {
        setLanguage(selectedOption.value);
    };

    const executeCode = async () => {
        const selectedLanguage = languageOptions.find(
            (option) => option.value === language
        );

        if (!selectedLanguage) {
            setOutput('Selected language is not supported.');
            return;
        }

        const payload = {
            source_code: code,
            language_id: selectedLanguage.id,
            stdin: '',
        };

        try {
            const response = await fetch(
                'https://judge0.p.rapidapi.com/submissions?base64_encoded=false&wait=false',
                {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': process.env
                            .NEXT_PUBLIC_RAPIDAPI_KEY as string,
                        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            const token = result.token;

            // Poll the API to check the status of the submission
            const checkStatus = async () => {
                const statusResponse = await fetch(
                    `https://judge0.p.rapidapi.com/submissions/${token}?base64_encoded=false`,
                    {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': process.env
                                .NEXT_PUBLIC_RAPIDAPI_KEY as string,
                            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                        },
                    }
                );

                if (!statusResponse.ok) {
                    throw new Error(`API error: ${statusResponse.status}`);
                }

                const statusResult = await statusResponse.json();

                if (statusResult.status.id <= 2) {
                    // Status is in progress, wait and check again
                    setTimeout(checkStatus, 1000);
                } else {
                    // Status is completed, set the output
                    setOutput(
                        statusResult.stdout ||
                            statusResult.stderr ||
                            'No output'
                    );
                }
            };

            checkStatus();
        } catch (error) {
            setOutput(`Error: ${(error as Error).message}`);
        }
    };
    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'white',
            color: 'black',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'black',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: 'white',
            color: 'black',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'lightgray' : 'white',
            color: 'black',
        }),
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>Code Executor</div>
            <Select
                options={languageOptions}
                onChange={handleLanguageChange}
                defaultValue={languageOptions[0]}
                styles={customStyles}
                className={styles.select}
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
                className={styles.editor}
            />
            <button onClick={executeCode} className={styles.button}>
                Run Code
            </button>
            <pre className={styles.output}>{output}</pre>
        </div>
    );
};

export default CodeExecutor;
