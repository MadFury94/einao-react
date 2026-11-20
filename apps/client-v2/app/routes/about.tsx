import type { Route } from "./+types/about";
import { About } from "~/components/about/About";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"About Einao Solutions | Enterprise Technology & Digital Transformation",description:"Learn about Einao Solutions, an established technology company helping organisations improve operations through consulting, automation, and digital systems.",path:"/about/"});}
export default function AboutRoute(){return <About/>;}
