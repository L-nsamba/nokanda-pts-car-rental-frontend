import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({ title, value, icon}) {
    return (
        <div className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
            style={{backgroundColor: '#15435B'}}
            >
                <FontAwesomeIcon icon={icon}/>

            </div>

            <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                <p className="text-sm font-bold mt-1" style={{color: '#15435B'}}>
                    {value ?? '-'}
                </p>
            </div>
        </div>
    )
}