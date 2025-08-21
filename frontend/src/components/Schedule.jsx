import React from 'react';

const Schedule = ({ schedule, openAddModal, openEditModal, handleDeleteItem, isChefView }) => {

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 text-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Day</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Meal Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
            {isChefView && <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {daysOfWeek.map(day => (
            mealTypes.map(mealType => {
              const item = schedule.find(i => i.day === day && i.mealType === mealType);
              return (
                <tr key={`${day}-${mealType}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{day}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{mealType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item?.price ? `${item.price.toFixed(2)}` : '-'}</td>
                  {isChefView && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item ? (
                        <>
                          <button onClick={() => openEditModal(item)} className="text-indigo-400 hover:text-indigo-600 mr-2">Edit</button>
                          <button onClick={() => handleDeleteItem(item)} className="text-red-400 hover:text-red-600">Delete</button>
                        </>
                      ) : (
                        <button onClick={() => openAddModal(day, mealType)} className="text-green-400 hover:text-green-600">Add</button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;