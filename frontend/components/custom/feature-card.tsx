export type FeaturePoint = {
  title: string;
  desc: string;
};
export type Feature = {
  image: string;
  featureTitle: string;
  featurePoints: FeaturePoint[];
};

export const features: Feature[] = [
  {
    image: "/forms.png",
    featureTitle: "Dynamic Form Builder",
    featurePoints: [
      {
        title: "Custom Form Creation",
        desc: "Build surveys, feedback forms, and data collection tools easily.",
      },
      {
        title: "Real-Time Responses",
        desc: "Monitor and analyze form submissions as they come in.",
      },
      {
        title: "Student-Friendly Design",
        desc: "Intuitive interface designed specifically for university students.",
      },
    ],
  },
  {
    image: "/mail.png",
    featureTitle: "Bulk Email Outreach",
    featurePoints: [
      {
        title: "Mass Communication",
        desc: "Send bulk emails for research surveys, event invitations, and more.",
      },
      {
        title: "Reliable Delivery",
        desc: "Queue-driven system ensures emails are sent reliably with retry mechanisms.",
      },
      {
        title: "Student Outreach",
        desc: "Perfect for connecting with peers, professors, and research participants.",
      },
    ],
  },
  {
    image: "/rag.png",
    featureTitle: "AI Document Assistant",
    featurePoints: [
      {
        title: "RAG-Powered Chat",
        desc: "Upload PDFs and have intelligent conversations with your documents.",
      },
      {
        title: "Research Support",
        desc: "Get instant answers and insights from your academic materials.",
      },
      {
        title: "Contextual Understanding",
        desc: "AI understands document context for accurate, relevant responses.",
      },
    ],
  },
];

export default function FeatureCard({ item }: { item: Feature }) {
  return (
    <div className="featureCard | group | lg:grid gap-8 grid-flow-col-dense place-items-center odd:grid-cols-[1fr,1.5fr] even:grid-cols-[1.5fr,1fr] w-[min(100%_-_2rem,1366px)] mx-auto bg-text/10 border-[3px] border-text/20 rounded-[2rem] lg:rounded-[3rem] p-4">
      <div className="space-y-4 p-4">
        <h3 className="text-xl lg:text-4xl font-bold">{item.featureTitle}</h3>
        <ul className="space-y-2">
          {item.featurePoints.map((item, idx) => (
            <li key={idx}>
              <p className="lg:text-2xl font-light">
                <span className="font-semibold">{item.title}: </span>
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <img
        src={item.image}
        alt="Feature Image"
        className="select-none [user-drag:none] rounded-2xl lg:rounded-[2rem] group-even:col-start-1"
      />
    </div>
  );
}
