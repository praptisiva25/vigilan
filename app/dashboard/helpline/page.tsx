"use client"

export default function HelplinePage() {

return ( <div className="p-10 space-y-8">


  <h1 className="text-3xl font-bold text-slate-800">
    Helpline & Support
  </h1>

  <p className="text-slate-600 max-w-2xl">
    If you encounter any issues with the Vigilan Monitoring System or need
    assistance with intrusion alerts, monitoring jobs, or camera feeds,
    please contact the support team using the information below.
  </p>

  <div className="grid grid-cols-2 gap-8">


    <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
      <h2 className="text-xl font-semibold text-slate-700">
        Technical Support
      </h2>

      <p className="text-slate-600">
        Email: support@vigilan.ai
      </p>

      <p className="text-slate-600">
        Phone: +1 (800) 555-0199
      </p>

      <p className="text-slate-500 text-sm">
        Available Monday – Friday, 9:00 AM – 6:00 PM
      </p>
    </div>

    <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
      <h2 className="text-xl font-semibold text-red-600">
        Emergency Security Line
      </h2>

      <p className="text-slate-600">
        Phone: +1 (800) 555-0111
      </p>

      <p className="text-slate-500 text-sm">
        Available 24/7 for urgent security incidents.
      </p>
    </div>

  </div>

  <div className="bg-slate-50 border rounded-lg p-6 max-w-2xl">
    <h3 className="font-semibold text-slate-700 mb-2">
      When reporting an issue please include:
    </h3>

    <ul className="list-disc list-inside text-slate-600 space-y-1">
      <li>Camera ID or camera name</li>
      <li>Time of the intrusion or incident</li>
      <li>Monitoring Job ID (if available)</li>
      <li>Screenshot or video reference if possible</li>
    </ul>
  </div>

</div>


)
}
