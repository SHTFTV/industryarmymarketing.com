import LocalCity from "./LocalCity";

const Langley = () => (
  <LocalCity
    data={{
      city: "Langley",
      slug: "langley",
      province: "BC",
      population: "150,000",
      blurb:
        "Own your trade in Langley. IAM gives you exclusive listing rights on the network's top trade domains for $10/month. Month-to-month. EyeSpyr verified. Lock the territory.",
      neighbourhoods: [
        "Langley City","Walnut Grove","Willoughby","Brookswood","Murrayville","Fort Langley","Aldergrove","Milner","Otter District","Salmon River","Glen Valley",
      ],
    }}
  />
);

export default Langley;