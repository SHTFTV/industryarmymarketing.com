import LocalCity from "./LocalCity";

const Vancouver = () => (
  <LocalCity
    data={{
      city: "Vancouver",
      slug: "vancouver",
      province: "BC",
      population: "700,000",
      blurb:
        "Stop sharing leads. Lock exclusive advertising rights on Vancouver's top trade domains. One contractor per trade. No one else gets in. $10/month, no contract, EyeSpyr verified.",
      neighbourhoods: [
        "Downtown","Kitsilano","Mount Pleasant","Yaletown","West End","Kerrisdale","Dunbar","Point Grey","Marpole","South Vancouver","East Van","Strathcona","Renfrew","Hastings-Sunrise","Killarney","Fairview",
      ],
    }}
  />
);

export default Vancouver;