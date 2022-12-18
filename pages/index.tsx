import Head from "next/head";
import styles from "../styles/Home.module.css";
import RhymeInputBox from "../components/RhymeInputBox";

export default function Home() {
  return (
    <>
      <Head>
        <title>Rap With Me</title>
        <meta name="description" content="Rap with me" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <RhymeInputBox />
      </main>
    </>
  );
}
