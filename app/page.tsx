import type { Metadata } from "next";
import { RoadmapApp } from "./roadmap-app";

export const metadata: Metadata = {
  title: "نقشه راه بنیان‌گذاران | Mahtab & Tom",
  description: "فضای کاری مشترک برای ساخت شرکت، یادگیری، اجرا و ثبت تجربه‌ها",
};

export default function Home() {
  return <RoadmapApp />;
}
