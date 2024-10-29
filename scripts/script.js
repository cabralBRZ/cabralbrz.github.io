        // Função para mostrar ou ocultar o campo de informações adicionais
        function toggleAdditionalInfo(checkbox) {
            const additionalInfo = document.getElementById(checkbox.dataset.info);
            additionalInfo.style.display = checkbox.checked ? 'block' : 'none';
        }

        // Função para salvar os dados do formulário
        function saveData() {
            const confirmation = confirm("Você deseja realmente salvar os dados?")

            if(!confirmation){
                return;
            }
            const projectData = {
                nomeProjeto: document.getElementById('nomeProjeto').value,
                codigoProjeto: document.getElementById('codigoProjeto').value,
                solicitante: document.getElementById('solicitante').value,
                desenvolvedor: document.getElementById('desenvolvedor').value,
                gestaoProjeto: document.getElementById('gestaoProjeto').value,
                description: document.getElementById('description').value,
                urlrepositorio: document.getElementById('urlrepositorio').value,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                deployproducao: document.getElementById('deployproducao').value,
                sustentacaoProjeto: document.getElementById('sustentacaoProjeto').value,
                sustentacaoOPS: document.getElementById('sustentacaoOPS').value,
                assuntoEmail: document.getElementById('assuntoEmail').value,
                checklist: []
            };

            // Coleta os dados do checklist principal
            document.querySelectorAll('.checklist').forEach(item => {
                const checkbox = item;
                const infoBox = document.getElementById(checkbox.dataset.info);

                // Verifica se o checkbox está marcado
                if (checkbox.checked) {
                    // Obtém a data do campo correspondente
                    const additionalInfoDate = infoBox.querySelector('input[type="date"]').value || '';

                    // Determina o título do e-mail com base no tipo de phaseout
                    const emailTitle = (checkbox.id === 'item1') ? document.getElementById('descriptionOPS').value :
                                       (checkbox.id === 'item2') ? document.getElementById('descriptionPCP').value : '';

                    // Adiciona as informações ao projeto
                    projectData.checklist.push({
                        item: checkbox.nextElementSibling.innerText.trim(),
                        checked: checkbox.checked,
                        additionalInfo: additionalInfoDate,
                        emailTitle: emailTitle // Salva o título correspondente
                    });
                }
            });

            // Coleta os dados do checklist adicional
            const additionalChecklist = ['sas_rtdm', 'sas_esp', 'sas_guide', 'sas_di'];
            additionalChecklist.forEach(itemId => {
                const checkbox = document.getElementById(itemId);
                if (checkbox.checked) {
                    projectData.checklist.push({
                        item: checkbox.nextElementSibling.innerText.trim(),
                        checked: checkbox.checked,
                        additionalInfo: '', // Aqui, se não houver informações adicionais, pode ser deixado vazio
                        emailTitle: '' // Não aplica para checklist adicional
                    });
                }
            });

            // Converte os dados do projeto em JSON
            const projectDataJSON = JSON.stringify(projectData, null, 2);

            // Função para obter a data no formato YYYYMMDD
            function getCurrentDate() {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Adiciona o 0 à esquerda, se necessário
                const day = String(today.getDate()).padStart(2, '0'); // Adiciona o 0 à esquerda, se necessário
                return `${year}${month}${day}`;
    }

            // Gera o nome do arquivo com o nome do projeto, código e a data de hoje
        const fileName = prompt(
        "Nome do arquivo json (sem extensão):", 
        `${(projectData.codigoProjeto || 'cod:0000').replace(/\s+/g, '_')}_${projectData.nomeProjeto.replace(/\s+/g, '_')}_${getCurrentDate()}`
    ) || `${(projectData.codigoProjeto || 'cod:0000').replace(/\s+/g, '_')}_${projectData.nomeProjeto.replace(/\s+/g, '_')}_${getCurrentDate()}`;

            const blob = new Blob([projectDataJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.json`; // Adiciona a extensão .json ao nome do arquivo
            document.body.appendChild(a);
            a.click(); // Aciona o download
            document.body.removeChild(a); // Remove o elemento após o download
            URL.revokeObjectURL(url); // Libera o URL
    }

    // Função para importar dados de um arquivo JSON
    function importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Preencher os campos do formulário com os dados importados
                    document.getElementById('nomeProjeto').value = importedData.nomeProjeto || '';
                    document.getElementById('codigoProjeto').value = importedData.codigoProjeto || '';
                    document.getElementById('solicitante').value = importedData.solicitante || '';
                    document.getElementById('desenvolvedor').value = importedData.desenvolvedor || '';
                    document.getElementById('gestaoProjeto').value = importedData.gestaoProjeto || '';
                    document.getElementById('description').value = importedData.description || '';
                    document.getElementById('urlrepositorio').value = importedData.urlrepositorio || '';
                    document.getElementById('startDate').value = importedData.startDate || '';
                    document.getElementById('endDate').value = importedData.endDate || '';
                    document.getElementById('deployproducao').value = importedData.deployproducao || '';
                    document.getElementById('sustentacaoProjeto').value = importedData.sustentacaoProjeto || '';
                    document.getElementById('sustentacaoOPS').value = importedData.sustentacaoOPS || '';
                    document.getElementById('assuntoEmail').value = importedData.assuntoEmail || '';

                    // Preencher o checklist principal
                    importedData.checklist.forEach(item => {
                        const checkbox = [...document.querySelectorAll('.checklist')].find(chk => 
                            chk.nextElementSibling.innerText.trim() === item.item
                        );

                        if (checkbox) {
                            checkbox.checked = item.checked;  // Marcar ou desmarcar o checkbox
                            toggleAdditionalInfo(checkbox);  // Mostrar informações adicionais

                            // Preenche os campos de informações adicionais
                            const additionalInfo = document.getElementById(checkbox.dataset.info);
                            if (additionalInfo) {
                                additionalInfo.querySelector('input[type="date"]').value = item.additionalInfo || '';
                                const titleField = (checkbox.id === 'item1') ? document.getElementById('descriptionOPS') :
                                                  (checkbox.id === 'item2') ? document.getElementById('descriptionPCP') : null;
                                if (titleField) titleField.value = item.emailTitle || '';
                            }
                        }
                    });

                    // Preencher os checkboxes do checklist adicional (ferramentas impactadas)
                    const additionalChecklist = ['sas_rtdm', 'sas_esp', 'sas_guide', 'sas_di'];
                    additionalChecklist.forEach(itemId => {
                        const checkbox = document.getElementById(itemId);
                        const checklistItem = importedData.checklist.find(item => item.item === checkbox.nextElementSibling.innerText.trim());
                        if (checklistItem) {
                            checkbox.checked = checklistItem.checked;  // Marcar ou desmarcar o checkbox
                        }
                    });

                } catch (error) {
                    alert("Erro ao importar dados: " + error);
                }
            };
            reader.readAsText(file);
        }
    }