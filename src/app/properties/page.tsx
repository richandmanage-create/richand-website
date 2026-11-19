import { PageIntro } from '@/components/shell';
import PropertyFilter from '@/components/property-filter';
export const metadata={title:'精選房源'};
export default function Page(){return <><PageIntro eyebrow="RICHAND EXCLUSIVE" title="專屬眼光，發現空間的可能。" description="大安、信義、中和、淡水。從理想生活出發，探索四種城市居住想像。"/><div className="wrap content-area"><PropertyFilter/></div></>}
