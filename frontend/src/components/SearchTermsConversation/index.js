import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../services/api";
import toastError from "../../errors/toastError";

const SearchMessages = () => {

  const { ticketId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);



  const handleChange = useCallback((e) => setSearchTerm(e.target.value), []);

  const handleSearch = useCallback(async (page) => {

    try {
        const { data } = await api.get(`/search/${ticketId}`, { params: { query: searchTerm, page } });
        setMessages(data[0])
        console.log(data[0])
    } catch (error) {
        toastError(error);
    } 

}, [ searchTerm, ticketId]);

useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
          setPage(1);
          handleSearch(1);
      } else {
          setMessages([]);
      }
  }, 1000);
  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);


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
        {messages.length > 0 ? messages.map((message) => {
          return (
            <li key={message._id}>
              <p>{message._source.message_body}</p>
              <p>{message._source.message_date}</p>
            </li> 
          )  
          } 
      
          ) :  <li>Nenhuma mensagem encontrada.</li>
        }
      </ul>
   
    </div>
  );
};

export default SearchMessages;
