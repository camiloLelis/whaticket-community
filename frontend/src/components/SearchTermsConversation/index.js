import React from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const SearchMessages = () => {
  return (
    <div>
      <input
        type="text"
        placeholder="Digite para buscar mensagens..."
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
