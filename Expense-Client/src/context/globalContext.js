import React, { useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:2001/";

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(null);

  const registerId = localStorage.getItem("id");
  const name = localStorage.getItem("name");

  const addIncome = async (registerId, income) => {
    const response = await axios
      .post(`${BASE_URL}addIncomes/${registerId}`, income)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getIncomes(registerId);
  };

  const getIncomes = async (registerId) => {
    const response = await axios.get(`${BASE_URL}readIncomes/${registerId}`);
    setIncomes(response.data);
    console.log(response.data, "response");
  };

  const updateIncome = async (id, income) => {
    const response = await axios
      .put(`${BASE_URL}updateIncome/${id}`, income)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getIncomes(registerId);
  };

  const deleteIncome = async (id) => {
    const res = await axios.delete(`${BASE_URL}deleteIncomes/${id}`);
    getIncomes(registerId);
  };

  const totalIncome = () => {
    let totalIncome = 0;
    incomes.forEach((income) => {
      totalIncome = totalIncome + income.amount;
    });

    return totalIncome;
  };

  //calculate incomes
  const addExpense = async (registerId, income) => {
    const response = await axios
      .post(`${BASE_URL}addExpenses/${registerId}`, income)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getExpenses(registerId);
  };

  const getExpenses = async (registerId) => {
    const response = await axios.get(`${BASE_URL}readExpenses/${registerId}`);
    setExpenses(response.data);
    console.log(response.data);
  };

  const updateExpense = async (id, income) => {
    const response = await axios
      .put(`${BASE_URL}updateExpenses/${id}`, income)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getExpenses(registerId);
  };

  const deleteExpense = async (id) => {
    const res = await axios.delete(`${BASE_URL}deleteExpenses/${id}`);
    getExpenses(registerId);
  };

  const totalExpenses = () => {
    let totalIncome = 0;
    expenses.forEach((income) => {
      totalIncome = totalIncome + income.amount;
    });

    return totalIncome;
  };

  const totalBalance = () => {
    return totalIncome() - totalExpenses();
  };

  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return history.slice(0, 3);
  };

  return (
    <GlobalContext.Provider
      value={{
        name,
        registerId,
        addIncome,
        getIncomes,
        incomes,
        updateIncome,
        deleteIncome,
        expenses,
        totalIncome,
        addExpense,
        getExpenses,
        updateExpense,
        deleteExpense,
        totalExpenses,
        totalBalance,
        transactionHistory,
        error,
        setError,
        edit,
        setEdit,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
