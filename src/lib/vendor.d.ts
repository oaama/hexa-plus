declare module "arabic-persian-reshaper" {
  const value: { ArabicShaper: { convertArabic: (text: string) => string } };
  export default value;
}
declare module "bidi-js" {
  export default function bidiFactory(): {
    getEmbeddingLevels: (text: string, direction?: string) => unknown;
    getReorderedString: (text: string, levels: unknown) => string;
  };
}
