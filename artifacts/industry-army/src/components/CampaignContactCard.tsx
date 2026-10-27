import { campaignContact } from "@/lib/campaignContact";

/** Native hide/reopen control shared by explicitly flagged IAM campaign articles. */
export default function CampaignContactCard({ site, label }: { site?: string; label?: string }) {
  const contact = campaignContact(site);
  if (!contact) return null;
  return <details data-iam-campaign-contact={contact.site} style={{position:"fixed",bottom:112,right:100,zIndex:45,maxWidth:250,padding:"12px 16px",borderRadius:10,border:"1px solid #b6c943",background:"#14211a",color:"#f5f3e9",fontSize:14}}>
    <summary style={{cursor:"pointer"}}>IAM · Construction marketing</summary>
    <p style={{margin:"10px 0"}}>Your brand, website or project-story enquiry belongs with IAM.</p>
    <p style={{margin:"10px 0",fontSize:12}}>{label || "Construction campaign"} · {contact.site}</p>
    <a style={{textDecoration:"underline",color:"#d6ed52"}} href={contact.href}>Discuss your project story</a>
  </details>;
}
