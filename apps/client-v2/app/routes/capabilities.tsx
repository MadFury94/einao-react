import type { Route } from "./+types/capabilities";
import { CapabilitiesOverview } from "~/components/capabilities/Capabilities";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Technology Consulting, Process Automation & Digital Solutions | Einao",description:"Explore Einao's IT consulting, business process automation, enterprise solutions, system integration, and custom digital development capabilities.",path:"/capabilities/"});}
export default function Capabilities(){return <CapabilitiesOverview/>;}
