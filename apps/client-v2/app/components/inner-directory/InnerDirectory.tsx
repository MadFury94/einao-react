import { Link } from "react-router";
import styles from "./InnerDirectory.module.css";

type Directory={key:"capabilities"|"solutions"|"industries";label:string;title:string;links:{label:string;href:string}[]};
const DIRECTORIES:Record<Directory["key"],Directory>={
 capabilities:{key:"capabilities",label:"Capabilities",title:"Explore our capabilities",links:[{label:"IT Consulting",href:"/capabilities/it-consulting/"},{label:"Business Process Automation",href:"/capabilities/business-process-automation/"},{label:"Enterprise Solutions",href:"/capabilities/enterprise-solutions/"}]},
 solutions:{key:"solutions",label:"Solutions",title:"Explore our solutions",links:[{label:"Custom Enterprise Systems",href:"/solutions/custom-enterprise-systems/"},{label:"IP Pro",href:"/solutions/ip-pro/"},{label:"Fylonn",href:"/solutions/fylonn/"},{label:"PayX",href:"/solutions/payx/"}]},
 industries:{key:"industries",label:"Industries",title:"Explore the organisations we support",links:[{label:"Government",href:"/industries/government/"},{label:"Business",href:"/industries/business/"},{label:"Regulatory Services",href:"/industries/regulatory-services/"}]}
};
export function InnerDirectory({section}:{section:string}){const directory=DIRECTORIES[section as Directory["key"]]??DIRECTORIES.capabilities;return <main className={styles.page}><div className={styles.shell}><header className={styles.intro}><span className={styles.eyebrow}>{directory.label}</span><h1 className={styles.title}>{directory.title}</h1><p className={styles.message}>There is no page here yet.</p><p className={styles.prompt}>Would you like to visit {directory.label.toLowerCase()}?</p></header><nav className={styles.linkGrid} aria-label={`${directory.label} pages`}>{directory.links.map(item=><Link className={styles.linkCard} key={item.href} to={item.href}><span className={styles.linkLabel}>{item.label}</span><span className={styles.arrow} aria-hidden="true">↗</span></Link>)}</nav></div></main>}
