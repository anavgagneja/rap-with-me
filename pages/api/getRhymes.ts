// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type GetRhymesResponse = {
  word: string;
  rhymes: string[];
};

const RHYME_ENDPOINT = "https://api.datamuse.com/words?rel_rhy=";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetRhymesResponse>
) {
  const { word, limit } = JSON.parse(req.body);
  console.log(`got the word ${encodeURIComponent(word)}`);
  return new Promise((resolve, _reject) => {
    fetch(`${RHYME_ENDPOINT}${encodeURIComponent(word)}`)
      .then((rhymeResponse) => rhymeResponse.json())
      .then((rhymeJson) => {
        let rhymes = rhymeJson.slice(0, limit).map((rhyme: any) => rhyme.word);
        console.log(`Rhymes: ${rhymes}`);
        res.status(200).json({ word: word, rhymes: rhymes });
        resolve(null);
      })
      .catch((error) => {
        console.log("Error", error);
        res.status(500).send(error);
        resolve(null);
      });
  });
}
