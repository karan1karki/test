import { useState, useEffect } from 'react'
import './App.css'

// list of the products given as per data
const products = [
  { name: "Item 1", price: 10, weight: 200 },
  { name: "Item 2", price: 100, weight: 20 },
  { name: "Item 3", price: 30, weight: 300 },
  { name: "Item 4", price: 20, weight: 500 },
  { name: "Item 5", price: 30, weight: 250 },
  { name: "Item 6", price: 40, weight: 10 },
  { name: "Item 7", price: 200, weight: 10 },
  { name: "Item 8", price: 120, weight: 500 },
  { name: "Item 9", price: 130, weight: 790 },
  { name: "Item 10", price: 20, weight: 100 },
  { name: "Item 11", price: 10, weight: 340 },
  { name: "Item 12", price: 4, weight: 800 },
  { name: "Item 13", price: 5, weight: 200 },
  { name: "Item 14", price: 240, weight: 20 },
  { name: "Item 15", price: 123, weight: 700 },
  { name: "Item 16", price: 245, weight: 10 },
  { name: "Item 17", price: 230, weight: 20 },
  { name: "Item 18", price: 110, weight: 200 },
  { name: "Item 19", price: 45, weight: 200 },
  { name: "Item 20", price: 67, weight: 20 },
  { name: "Item 21", price: 88, weight: 300 },
  { name: "Item 22", price: 10, weight: 500 },
  { name: "Item 23", price: 17, weight: 250 },
  { name: "Item 24", price: 19, weight: 10 },
  { name: "Item 25", price: 89, weight: 10 },
  { name: "Item 26", price: 45, weight: 500 },
  { name: "Item 27", price: 99, weight: 790 },
  { name: "Item 28", price: 125, weight: 100 },
  { name: "Item 29", price: 198, weight: 340 },
  { name: "Item 30", price: 220, weight: 800 },
  { name: "Item 31", price: 249, weight: 200 },
  { name: "Item 32", price: 230, weight: 20 },
  { name: "Item 33", price: 190, weight: 700 },
  { name: "Item 34", price: 45, weight: 10 },
  { name: "Item 35", price: 12, weight: 20 },
  { name: "Item 36", price: 5, weight: 200 },
  { name: "Item 37", price: 2, weight: 200 },
  { name: "Item 38", price: 90, weight: 20 },
  { name: "Item 39", price: 12, weight: 300 },
  { name: "Item 40", price: 167, weight: 500 },
  { name: "Item 41", price: 12, weight: 250 },
  { name: "Item 42", price: 8, weight: 10 },
  { name: "Item 43", price: 2, weight: 10 },
  { name: "Item 44", price: 9, weight: 500 },
  { name: "Item 45", price: 210, weight: 790 },
  { name: "Item 46", price: 167, weight: 100 },
  { name: "Item 47", price: 23, weight: 340 },
  { name: "Item 48", price: 190, weight: 800 },
  { name: "Item 49", price: 199, weight: 200 },
  { name: "Item 50", price: 12, weight: 20 },
]

//list of the charges of courier as per given
const getCourierCharge = (weight) => {
  if (weight <= 200) return 5
  if (weight <= 500) return 10
  if (weight <= 1000) return 15
  return 20
}

const STORAGE_KEY = 'packages';

const splitIntoPackages = (items, existingPackageCount = 0) => {
  const sorted = [...items].sort((a, b) => b.price - a.price)
  const packages = []

  for (let item of sorted) {
    let added = false

    for (let pkg of packages) {
      if (pkg.totalPrice + item.price <= 250) {
        pkg.items.push(item)
        pkg.totalPrice += item.price
        pkg.totalWeight += item.weight
        added = true
        break
      }
    }

    if (!added) {
      packages.push({
        items: [item],
        totalPrice: item.price,
        totalWeight: item.weight,
      })
    }
  }

  return packages.map((pkg, idx) => ({
    id: existingPackageCount + idx + 1,  // Continue numbering from existing packages
    items: pkg.items,
    totalPrice: pkg.totalPrice,
    totalWeight: pkg.totalWeight,
    courierPrice: getCourierCharge(pkg.totalWeight),
  }))
}

const App = () => {
  const [selectedItems, setSelectedItems] = useState([])
  const [packages, setPackages] = useState([])
  const [availableItems, setAvailableItems] = useState([])
  const [activePackage, setActivePackage] = useState(null)

  // Load packages from localStorage on initial render
  useEffect(() => {
    const savedPackages = localStorage.getItem(STORAGE_KEY);
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    }
  }, []);

  // Save packages to localStorage whenever they change
  useEffect(() => {
    if (packages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
    }
  }, [packages]);

  const toggleItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    )
  }

  const handlePlaceOrder = () => {
    const result = splitIntoPackages(selectedItems, packages.length)
    const newPackages = [...packages, ...result]
    setPackages(newPackages)
    // Set remaining items that weren't packed (if any)
    const packedItems = result.flatMap(pkg => pkg.items)
    setAvailableItems(selectedItems.filter(item => !packedItems.includes(item)))
    // Clear selection after order is placed
    setSelectedItems([])
  }

  const addToPackage = (pkgId) => {
    setActivePackage(pkgId)
  }

  const handleAddItemToPackage = (item) => {
    if (!activePackage) return
    
    setPackages(prev => {
      const updatedPackages = prev.map(pkg => {
        if (pkg.id === activePackage) {
          const newPrice = pkg.totalPrice + item.price
          if (newPrice > 250) {
            alert("Cannot add item - package total would exceed $250")
            return pkg
          }
          return {
            ...pkg,
            items: [...pkg.items, item],
            totalPrice: newPrice,
            totalWeight: pkg.totalWeight + item.weight,
            courierPrice: getCourierCharge(pkg.totalWeight + item.weight)
          }
        }
        return pkg
      })
      return updatedPackages
    })

    // Remove from available items
    setAvailableItems(prev => prev.filter(i => i !== item))
    setActivePackage(null)
  }

  const clearPackages = () => {
    setPackages([])
    setAvailableItems([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app-container">
      <h2>Product List</h2>
      {packages.length > 0 && (
        <button 
          onClick={clearPackages}
          style={{ marginBottom: '1rem', backgroundColor: '#ff4444' }}
        >
          Clear All Packages
        </button>
      )}
      <div className="tables-container">
        {[products.slice(0, 25), products.slice(25)].map((chunk, tableIdx) => (
          <div className="product-table" key={tableIdx}>
            <div className="table-header">
              <div className="table-cell">Select</div>
              <div className="table-cell">Name</div>
              <div className="table-cell">Price</div>
              <div className="table-cell">Weight</div>
            </div>
            {chunk.map((item, index) => (
              <div className="table-row" key={index + tableIdx * 25}>
                <div className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => toggleItem(item)}
                  />
                </div>
                <div className="table-cell">{item.name}</div>
                <div className="table-cell">${item.price}</div>
                <div className="table-cell">{item.weight}g</div>
              </div>
            ))}
          </div>
        ))}
      </div>
  
      <button 
        onClick={handlePlaceOrder} 
        style={{ marginTop: '1rem' }}
        disabled={selectedItems.length === 0}
      >
        Place order
      </button>
  
      {packages.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Your Packages (Total: {packages.length})</h3>
          {packages.map((pkg) => (
            <div key={pkg.id} style={{ 
              marginBottom: '1.5rem',
              border: activePackage === pkg.id ? '2px solid blue' : '1px solid #ccc',
              padding: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Package {pkg.id}</strong>
                <button 
                  onClick={() => addToPackage(pkg.id)}
                  disabled={availableItems.length === 0}
                >
                  Add items to this package
                </button>
              </div>
              <p>Items - {pkg.items.map((i) => i.name).join(', ')}</p>
              <p>Total weight - {pkg.totalWeight}g</p>
              <p>Total price - ${pkg.totalPrice}</p>
              <p>Courier price - ${pkg.courierPrice}</p>
            </div>
          ))}
        </div>
      )}

      {availableItems.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Available Items to Add:</h3>
          <div className="table-header">
            <div className="table-cell">Add</div>
            <div className="table-cell">Name</div>
            <div className="table-cell">Price</div>
            <div className="table-cell">Weight</div>
          </div>
          {availableItems.map((item, index) => (
            <div className="table-row" key={`available-${index}`}>
              <div className="table-cell">
                <button 
                  onClick={() => handleAddItemToPackage(item)}
                  disabled={!activePackage}
                >
                  Add
                </button>
              </div>
              <div className="table-cell">{item.name}</div>
              <div className="table-cell">${item.price}</div>
              <div className="table-cell">{item.weight}g</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App