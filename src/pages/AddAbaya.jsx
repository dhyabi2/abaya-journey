import React from 'react';

const AddAbaya = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submission is disabled in this dummy version.');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Abaya</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brand" className="block mb-1">Brand</label>
          <input type="text" id="brand" name="brand" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input type="number" id="price" name="price" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1">Image URL</label>
          <input type="url" id="image" name="image" className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
          Add Abaya (Dummy)
        </button>
      </form>
    </div>
  );
};

export default AddAbaya;
