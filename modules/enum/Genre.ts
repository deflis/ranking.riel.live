const Genre = new Map<number, string>();

Genre.set(101, "異世界〔恋愛〕");
Genre.set(102, "現実世界〔恋愛〕");
Genre.set(201, "ハイファンタジー〔ファンタジー〕");
Genre.set(202, "ローファンタジー〔ファンタジー〕");
Genre.set(301, "純文学〔文芸〕");
Genre.set(302, "ヒューマンドラマ〔文芸〕");
Genre.set(303, "歴史〔文芸〕");
Genre.set(304, "推理〔文芸〕");
Genre.set(305, "ホラー〔文芸〕");
Genre.set(306, "アクション〔文芸〕");
Genre.set(307, "コメディー〔文芸〕");
Genre.set(401, "VRゲーム〔SF〕");
Genre.set(402, "宇宙〔SF〕");
Genre.set(403, "空想科学〔SF〕");
Genre.set(404, "パニック〔SF〕");
Genre.set(9901, "童話〔その他〕");
Genre.set(9902, "詩〔その他〕");
Genre.set(9903, "エッセイ〔その他〕");
Genre.set(9904, "リプレイ〔その他〕");
Genre.set(9999, "その他〔その他〕");
Genre.set(9801, "ノンジャンル〔ノンジャンル〕");

export default Genre;


export const allGenres = Array.from(Genre.keys());