import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useGlobalContext } from "../../context/globalContext";
import { InnerLayout } from "../../styles/Layouts";
import IncomeItem from "../IncomeItem/IncomeItem";
import ExpenseForm from "./ExpenseForm";

function Expenses() {
  const {
    expenses,
    getExpenses,
    deleteExpense,
    totalExpenses,
    registerId,
  } = useGlobalContext();

  useEffect(() => {
    getExpenses(registerId);
  }, []);

  const [selectedValue, setSelectedValue] = useState(""); 
  const [inputValue, setInputValue] = useState(""); 

  const handleSelectChange = (e) => {
    setSelectedValue(e.target.value);
    setInputValue(""); 
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const filteredData = expenses.filter((item) =>{
    const value = item[selectedValue]
     if(value && inputValue){
        if(selectedValue !== "date"){
          return value.toString().toLowerCase().includes(inputValue.toLowerCase())
        }else{
          return new Date(value).toLocaleDateString() === new Date(inputValue).toLocaleDateString()
        }
     }
    return true
  }
  );

  const InputField = () => {
    if (selectedValue === "title") {
      return (
        <input
          type="text"
          placeholder="Enter title"
          value={inputValue}
          onChange={handleInputChange}
        />
      );
    } else if (selectedValue === "amount") {
      return (
        <input
          type="number"
          placeholder="Enter amount"
          value={inputValue}
          onChange={handleInputChange}
        />
      );
    } else if (selectedValue === "date") {
      return (
        <input type="date" value={inputValue} onChange={handleInputChange} />
      );
    } else if (selectedValue === "Category") {
      return (
        <input
          type="text"
          placeholder="Enter category"
          value={inputValue}
          onChange={handleInputChange}
        />
      );
    }
    return null; // No input field for other options
  };

  return (
    <ExpenseStyled>
      <InnerLayout>
        <h1>Expenses</h1>
        <h2 className="total-income">
          Total Expense: <span>${totalExpenses()}</span>
        </h2>
        <div className="income-content">
          <div className="form-container">
            <ExpenseForm />
          </div>

          <div className="incomes">
            <header>
              <div>
                <label>Filter Type : </label>
                <select value={selectedValue} onChange={handleSelectChange}>
                  <option>Select Option</option>
                  <option value="title">Title</option>
                  <option value="amount">Amount</option>
                  <option value="date">Date</option>
                  
                </select>
              </div>
              <div>
                {InputField()}
              </div>
            </header>
            {filteredData.map((income) => {
              const { id, title, amount, date, category, description, type } =
                income;
              console.log(income);
              return (
                <IncomeItem
                  key={id}
                  id={id}
                  title={title}
                  description={description}
                  amount={amount}
                  date={date}
                  type={type}
                  category={category}
                  indicatorColor="var(--color-green)"
                  deleteItem={deleteExpense}
                  cardType="expense"
                />
              );
            })}
          </div>
        </div>
      </InnerLayout>
    </ExpenseStyled>
  );
}

const ExpenseStyled = styled.div`
  display: flex;
  overflow: auto;
  .total-income {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fcf6f9;
    border: 2px solid #ffffff;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 1rem;
    margin: 1rem 0;
    font-size: 2rem;
    gap: 0.5rem;
    span {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--color-green);
    }
  }
  .income-content {
    display: flex;
    gap: 2rem;
    .incomes {
      flex: 1;
    }
  }
  input,select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid #fff;
    background: transparent;
    resize: none;
    margin-bottom: 10px;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    color: rgba(34, 34, 96, 0.9);
    &::placeholder {
      color: rgba(34, 34, 96, 0.4);
    }
  }
  label {
    margin: 0 10px;
  }
  header {
    display: flex;
  }
`;

export default Expenses;
