import LocalCity from "./LocalCity";

const Surrey = () => (
  <LocalCity
    data={{
      city: "Surrey",
      slug: "surrey",
      province: "BC",
      population: "568,000",
      blurb:
        "Lock your trade in Surrey before someone else does. IAM gives you exclusive territory across the trade-domain network — one contractor per trade, EyeSpyr verified, $10/month.",
      neighbourhoods: [
        "Whalley","Guildford","Fleetwood","Newton","Cloverdale","South Surrey","White Rock","Port Kells","Bridgeview","Bear Creek","Sullivan Heights","Panorama Ridge",
      ],
    }}
  />
);

export default Surrey;