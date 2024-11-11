import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../services/api";
import toastError from "../../errors/toastError";

const SearchMessages = () => {

  const { ticketId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = useCallback((e) => setSearchTerm(e.target.value), []);

  const handleSearch = useCallback(async (page) => {

    try {
        const { data } = await api.get(`/search/${ticketId}`, { params: { query: searchTerm, page } });
    } catch (error) {
        toastError(error);
    } 
}, [ searchTerm, ticketId]);


  return (
    <div>
      <input
        type="text"
        placeholder="Digite para buscar mensagens..."
        value={searchTerm}
        onChange={handleChange}
        style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
      />
      {<p>Carregando...</p>}
      <ul>
        <li>Nenhuma mensagem encontrada.</li>
      </ul>
   
    </div>
  );
};

export default SearchMessages;
