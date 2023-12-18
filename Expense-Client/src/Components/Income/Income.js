import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useGlobalContext } from "../../context/globalContext";
import { InnerLayout } from "../../styles/Layouts";
import Form from "../Form/Form";
import IncomeItem from "../IncomeItem/IncomeItem";

function Income() {
  const {
    addIncome,
    incomes,
    getIncomes,
    updateIncome,
    deleteIncome,
    totalIncome,
    registerId,
  } = useGlobalContext();

  useEffect(() => {
    // const registerId = localStorage.getItem('id');
    getIncomes(registerId);
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

  const filteredData = incomes.filter((item) =>{
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
    return null;
  };

  return (
    <IncomeStyled>
      <InnerLayout>
        <h1>Incomes</h1>
        <h2 className="total-income">
          Total Income: <span>${totalIncome()}</span>
        </h2>
        <div className="income-content">
          <div className="form-container">
            <Form />
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
                  updateItem={updateIncome}
                  deleteItem={deleteIncome}
                  cardType="income"
                />
              );
            })}
          </div>
        </div>
      </InnerLayout>
    </IncomeStyled>
  );
}

const IncomeStyled = styled.div`
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

export default Income;
