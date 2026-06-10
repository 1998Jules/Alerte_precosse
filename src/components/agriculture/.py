 {/* MODAL FORMULAIRE CALENDRIER (NOUVEAU) */}
      {showCalendarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-bold text-gray-800">{editingCalendarItem ? 'Modifier la culture' : 'Nouvelle culture calendaire'}</h3>
              <button onClick={() => setShowCalendarForm(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <CropCalendarForm 
                item={editingCalendarItem} 
                onSave={handleSaveCalendarItem} 
                onCancel={() => setShowCalendarForm(false)} 
              />
            </div>
          </div>
        </div>
      )}