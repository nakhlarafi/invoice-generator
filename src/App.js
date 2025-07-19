import logo from './logo.svg';
import './App.css';
import InvoiceForm from './InvoiceForm';

function App() {
  return (
    <div className="App">
       {/* call invoice.js here */}
      <h1>Invoice Generator</h1>
      <p>Use the form below to generate an invoice PDF.</p>
      <InvoiceForm/>
    </div>
  );
}

export default App;
