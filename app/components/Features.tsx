import {
  CheckCircle,
  Clock,
  Edit,
  Smile,
  TableRowsSplit,
  Zap,
} from "lucide-react";

const features = [
  {
    name: "Streamlined Interface",
    description:
      "Clean and intuitive design that helps you focus on your tasks without distractions.",
    icon: CheckCircle,
  },
  {
    name: "Today & Tomorrow Views",
    description:
      "Organize and plan your tasks effectively for today and tomorrow. Stay on top of your priorities with ease.",
    icon: TableRowsSplit,
  },
  {
    name: "Lightning-Fast Performance",
    description:
      "Optimized for speed, ensuring a smooth and responsive experience on any device.",
    icon: Zap,
  },
  {
    name: "Pomodoro Timer",
    description:
      "Boost your productivity with focused work intervals and regular breaks using the Pomodoro technique.",
    icon: Clock,
  },
  {
    name: "Mood Logger",
    description:
      "Track and reflect on your emotions to gain insights and improve your well-being over time.",
    icon: Smile,
  },
  {
    name: "Quick Notes",
    description:
      "Capture your thoughts and ideas instantly with an easy-to-use note-taking tool.",
    icon: Edit,
  },
];

export default function Features() {
  return (
    <div className="py-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to work
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Minimo provides the tools you need to streamline your workflow and
            boost productivity.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <dt className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mr-4">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
