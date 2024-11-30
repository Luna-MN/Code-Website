import Head from 'next/head';
import CodeExecutor from '../components/CodeExecutor';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Code Executor</title>
            </Head>
            <main>
                <h1>Code Executor</h1>
                <CodeExecutor />
            </main>
        </div>
    );
}
