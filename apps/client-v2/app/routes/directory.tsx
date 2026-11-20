import type { Route } from "./+types/directory";
import { InnerDirectory } from "~/components/inner-directory/InnerDirectory";
import { seoMeta } from "~/lib/seo";
export function meta({params}:Route.MetaArgs){const section=params.section??"capabilities";const label=section.charAt(0).toUpperCase()+section.slice(1);return [{...seoMeta({title:`${label} | Einao Solutions`,description:`Explore Einao Solutions ${section}.`,path:`/${section}/`})[0]},{name:"robots",content:"noindex, follow"}];}
export default function DirectoryRoute({params}:Route.ComponentProps){return <InnerDirectory section={params.section??"capabilities"}/>;}
