import { Card, Chip, Paper, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/system";
import styles from "../styles/RhymeBox.module.css";

type Rhymes = {
  word: string;
  rhymes: string[];
  color: string;
};

function RhymeInputBox() {
  const MINIMUM_WORD_LENGTH = 4;
  const MAX_RHYMES_PER_WORD = 3;
  const COLORS = [
    "#e4dffe",
    "#9aacfe",
    "#467bfe",
    "#ffe0af",
    "#feafac",
    "#fe82a7",
    "#f5b9d2",
    "#8cd3f1",
    "#eff4f2",
    "#d4b1f7",
    "#d8f698",
  ];
  const [inputList, setInputList] = useState<string[]>([]);
  const [rhymeList, setRhymeList] = useState<Rhymes[]>([]);
  const [output, setOutput] = useState<React.ReactElement[]>([]);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [wordMap, setWordMap] = useState<any>({});
  const outputBottomRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    let wordChips: React.ReactElement[] = [];
    rhymeList.forEach((rhymes, i) => {
      rhymes.rhymes.forEach((word, j) => {
        wordChips.push(
          <Chip
            sx={{ bgcolor: rhymes.color }}
            className={styles.outputChip}
            key={`${i}-${j}-${word}`}
            label={word}
          />
        );
      });
    });
    setOutput(wordChips);
  }, [rhymeList]);

  useEffect(() => {
    if (outputBottomRef.current) {
      const offset = outputBottomRef.current.scrollHeight;
      console.log(`offset: ${offset}`);
      outputBottomRef.current?.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [output]);

  function handleInputChange(event: any) {
    // Replace all non-letter, non-whitespace characters except for ' - _ with space
    // so that they terminate words
    const rawInput = event.target.value.replace(/[^a-zA-Z\s'-_]+/g, " ");

    // If box is empty, reset contents of output
    if (rawInput.trim() === "") {
      setRhymeList([]);
      setOutput([]);
      setInputList([]);
      return;
    }

    // If there is whitespace at end, consider last typed word as completed otherwise
    // pop last token off to prevent using unfinished word
    const lastWordCompleted = rawInput.length !== rawInput.trimEnd().length;
    const inputTokenized = rawInput.match(/\b((\w|'|-)+)\b/g) || [];
    if (!lastWordCompleted && inputTokenized.length > 0) {
      inputTokenized.pop();
    }

    while (inputTokenized.length > 0) {
      const lastWord = inputTokenized.pop();
      if (lastWord === inputList.at(-1)) {
        break;
      } else if (lastWord.length >= MINIMUM_WORD_LENGTH) {
        handleNewWord(lastWord);
        break;
      }
    }
  }

  function getNextColor(): string {
    const color = COLORS[(colorIndex + 1) % COLORS.length];
    setColorIndex(colorIndex + 1);
    return color;
  }

  function handleNewWord(word: string) {
    const cachedRhymes = wordMap[word];
    if (cachedRhymes) {
      console.log(`cache: ${JSON.stringify(cachedRhymes)}`);
      addRhymes(word, cachedRhymes.rhymes, cachedRhymes.color);
      return;
    }
    fetch("/api/getRhymes", {
      method: "POST",
      body: JSON.stringify({ word: word, limit: MAX_RHYMES_PER_WORD }),
    })
      .then((res) => res.json())
      .then((res) => {
        addRhymes(word, res.rhymes, null);
      });
  }

  function addRhymes(
    word: string,
    rhymingWords: string[],
    colorOverride: string | null
  ) {
    if (rhymingWords && rhymingWords.length > 0) {
      console.log(rhymingWords);
      setInputList(inputList.concat(word));
      const color = colorOverride ? colorOverride : getNextColor();
      const rhymes: Rhymes = { word, rhymes: rhymingWords, color };
      setRhymeList(rhymeList.concat(rhymes));
      if (!wordMap[word]) {
        let newWordMap = wordMap;
        newWordMap[word] = rhymes;
        setWordMap(newWordMap);
      }
    }
  }

  return (
    <>
      <TextField
        id="input-field"
        label="Start Writing"
        multiline
        fullWidth
        variant="filled"
        rows={10}
        onChange={handleInputChange}
      />
      <br />
      <Paper ref={outputBottomRef} elevation={1} className={styles.outputBox}>
        {output}
      </Paper>
    </>
  );
}

export default RhymeInputBox;
