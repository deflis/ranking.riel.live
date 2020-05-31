import { Router } from "express";
import { search, Fields } from "narou";

const router = Router();

async function getTitle(ncode: string): Promise<string | undefined> {
  const detailData = await search()
    .ncode(ncode)
    .fields(Fields.title)
    .execute();
  return detailData.values?.[0].title;
}

router.get("/:ncode", async (req, res) => {
  try {
    const title = await getTitle(req.params.ncode);

    res.set("Cache-Control", "public, max-age=300, s-maxage=86400");
    res.render("index.ejs", { title });
  } catch (e) {
    console.error(e);
    res.render("index.ejs", { title: "" });
  }
});

export default router;
