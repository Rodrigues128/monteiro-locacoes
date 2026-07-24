-- Antes de executar, envie as imagens locais para o bucket `catalog` mantendo os caminhos abaixo.
-- Exemplo: public/images/real/toboga-real.jpeg -> products/toboga-real.jpeg
insert into public.products (name, category, recommended_age, size, allows_water, capacity, price, description, features, image_path) values
('Tobogã Aventura', 'Infláveis', '4+', '8 × 4 m', true, '8 crianças', 550, 'Uma atração de grande impacto para transformar a festa em uma aventura inesquecível.', '["Estrutura inflável reforçada", "Escada de acesso com degraus", "Piscina de amortecimento", "Montagem e desmontagem inclusas"]', 'products/toboga-real.jpeg'),
('Pula-Pula Premium', 'Brinquedos', '3+', '4,3 × 4,3 m', false, '6 crianças', 180, 'Estrutura profissional com rede de proteção e montagem completa no local.', '["Rede de proteção total", "Lona de alta resistência", "Capacidade para 6 crianças", "Montagem inclusa"]', 'products/pula-pula-real.jpeg'),
('Piscina de Bolinhas', 'Brinquedos', '2+', '3 × 3 m', false, '8 crianças', 220, 'Diversão segura para os pequenos, com cores vibrantes e acabamento impecável.', '["Bolinhas coloridas", "Estrutura protegida por rede", "Ideal para crianças pequenas", "Higienização completa"]', 'products/piscina-bolinhas-real.jpeg'),
('Estação Algodão Doce', 'Doces', 'Livre', '2 × 2 m', false, 'Evento', 125, 'Máquina profissional pronta para adoçar o evento. Insumos sob consulta.', '["Máquina profissional", "Carrinho de apoio", "Insumos sob consulta", "Monitor disponível"]', 'products/algodao-doce.png'),
('Arco de Balões', 'Decoração', 'Livre', '3 × 2,5 m', false, 'Personalizado', 200, 'Composição orgânica personalizada para valorizar a entrada ou mesa principal.', '["Balões premium", "Cores personalizadas", "Montagem no local", "Composição orgânica"]', 'products/arco-baloes.png'),
('Kit Mesas & Cadeiras', 'Estrutura', 'Livre', 'Sob medida', false, 'Personalizado', 69, 'Conjuntos para receber seus convidados com praticidade, organização e conforto.', '["Mesas e cadeiras resistentes", "Quantidade personalizada", "Entrega organizada", "Montagem sob consulta"]', 'products/mesas-cadeiras-real.jpeg'),
('Mesa de Sinuca', 'Jogos', 'Livre', 'Consultar', false, 'Uso alternado', null, 'Uma opção clássica para divertir jovens e adultos durante todo o evento.', '["Tacos e bolas inclusos", "Montagem no local", "Ideal para confraternizações", "Disponibilidade sob consulta"]', 'products/sinuca-real.jpeg'),
('Pebolim', 'Jogos', 'Livre', 'Consultar', false, 'Uso alternado', null, 'Partidas rápidas e muita diversão para completar a área de jogos da festa.', '["Mesa completa", "Montagem no local", "Diversão para várias idades", "Disponibilidade sob consulta"]', 'products/pebolim-real.jpeg'),
('Aero Hockey', 'Jogos', 'Livre', 'Consultar', false, 'Uso alternado', null, 'Uma atração dinâmica para deixar a área de jogos ainda mais animada.', '["Acessórios inclusos", "Montagem no local", "Ideal para eventos e festas", "Disponibilidade sob consulta"]', 'products/aero-hockey-real.jpeg');

insert into public.gallery_images (image_path, alt_text, sort_order) values
('gallery/evento-com-criancas.jpeg', 'Crianças brincando no pula-pula em um evento atendido pela Monteiro Locações', 1),
('gallery/montagem-completa-real.jpeg', 'Montagem completa com brinquedos e estrutura para festa', 2),
('gallery/recreacao-real.jpeg', 'Espaço de recreação preparado pela Monteiro Locações', 3),
('gallery/mesas-cadeiras-real.jpeg', 'Mesas e cadeiras organizadas para receber os convidados', 4),
('gallery/sinuca-real.jpeg', 'Mesa de sinuca instalada em uma confraternização', 5),
('gallery/piscina-bolinhas-real.jpeg', 'Piscina de bolinhas montada para uma festa infantil', 6);
