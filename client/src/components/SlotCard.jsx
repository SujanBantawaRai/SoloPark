const SlotCard = ({ slot, onBook }) => {
    let bgColor = 'bg-gray-200';
    let borderColor = 'border-gray-300';
    let statusText = 'Unknown';
    let statusColor = 'text-gray-500';

    switch (slot.status) {
        case 'free':
            bgColor = 'bg-green-100 hover:bg-green-200 cursor-pointer';
            borderColor = 'border-green-300';
            statusText = 'Available';
            statusColor = 'text-green-700';
            break;
        case 'occupied':
            bgColor = 'bg-red-100';
            borderColor = 'border-red-300';
            statusText = 'Occupied';
            statusColor = 'text-red-700';
            break;
        case 'reserved':
            bgColor = 'bg-yellow-100';
            borderColor = 'border-yellow-300';
            statusText = 'Reserved';
            statusColor = 'text-yellow-700';
            break;
        case 'maintenance':
            bgColor = 'bg-gray-300';
            borderColor = 'border-gray-400';
            statusText = 'Maintenance';
            statusColor = 'text-gray-700';
            break;
        default:
            break;
    }

    // Role-based filtering visual cue (optional)
    return (
        <div
            onClick={() => slot.status === 'free' && onBook(slot)}
            className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor} transition-all duration-200 flex flex-col items-center justify-center h-32 shadow-sm`}
        >
            <h3 className="text-xl font-bold text-gray-800">{slot.slotNumber}</h3>
            <p className="text-sm text-gray-600">{slot.zone}</p>
            <span className={`mt-2 px-2 py-1 rounded-full text-xs font-bold bg-white ${statusColor}`}>
                {statusText}
            </span>
            <p className="text-xs text-gray-500 mt-1 capitalize">{slot.slotType}</p>
        </div>
    );
};

export default SlotCard;
