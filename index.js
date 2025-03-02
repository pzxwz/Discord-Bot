const {
    Client,
    IntentsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType
} = require('discord.js');
const ReportSystem = require('./ReportSystem');
const TOKEN = '';  
const STAFF_ROLE_ID = '';  
const ADMIN_ROLE_ID = ''; 
const PERMISSION_ROLE_ID = ''; 

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
    ],
});

client.once('ready', () => {
    console.log(`${client.user.tag} está online!`);
    client.user.setActivity('leaguemc.com.br ⚔️', { type: 0 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!ticket')) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'LeagueMC • Central de Atendimento', iconURL: 'https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048' })
            .setDescription(
                'Bem-vindo à Central de Atendimento do LeagueMC!\n\nCaso tenha alguma dúvida ou problema, clique no botão abaixo para abrir um ticket e obter suporte da nossa equipe.\n\n⚠️ **Importante:** Não abra tickets sem motivo algum, isso pode ocasionar em uma punição.\n🔎 Nossa equipe está disponível para ajudá-lo!'
            )
            .setThumbnail('https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048')
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Abrir Ticket')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    } else if (message.content.startsWith('!appeal')) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'LeagueMC • Sistema de Revisões', iconURL: 'https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048' })
            .setDescription(
                'Acha que foi punido injustamente? 😟\n\nPois bem, você está no lugar certo! Para solicitar uma revisão clique no botão abaixo.'
            )
            .setThumbnail('https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048')
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('request_appeal')
                .setLabel('Solicitar Revisão')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;

    if (interaction.customId === 'open_ticket') {
        const category = guild.channels.cache.find((c) => c.name === 'Tickets' && c.type === ChannelType.GuildCategory) ||
            (await guild.channels.create({
                name: 'Tickets',
                type: ChannelType.GuildCategory,
            }));

        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            parent: category,
            topic: `Ticket de ${interaction.user.username}`,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle('Olá! Seja bem-vindo(a) ao seu ticket de **Dúvidas em Gerais**.')
            .setDescription(
                'O nosso servidor agradece pelo seu contato e estamos à disposição para ajudá-lo.\n\n' +
                'Para isso, **envie o seu nickname exato**, juntamente com sua dúvida, para que possamos atendê-lo com mais celeridade.\n\n' +
                '**Assunto:** Dúvidas em Gerais.'
            )
            .setThumbnail(interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Fechar Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@&${STAFF_ROLE_ID}> | ${interaction.user}`, embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Seu ticket foi criado! Você foi mencionado nele.', ephemeral: true });
    } else if (interaction.customId === 'close_ticket') {
        if (interaction.user.id !== interaction.channel.name.split('-')[1] && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Você não tem permissão para fechar este ticket.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Fechando ticket...')
            .setDescription('Este ticket será encerrado em 5 segundos. Caso precise de mais ajuda, por favor, reabra o ticket.')
            .setColor('#FF0000')
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' });

        await interaction.reply({ embeds: [embed], ephemeral: false });

        setTimeout(async () => {
            await interaction.channel.delete();
        }, 5000);
    } else if (interaction.customId === 'request_appeal') {
        const modal = new ModalBuilder()
            .setCustomId('appeal_form')
            .setTitle('Solicitação de Revisão');

        const nicknameInput = new TextInputBuilder()
            .setCustomId('nickname')
            .setLabel('Qual o seu nickname?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const dateInput = new TextInputBuilder()
            .setCustomId('punishment_date')
            .setLabel('Qual a data da sua punição?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const evidenceInput = new TextInputBuilder()
            .setCustomId('evidence')
            .setLabel('Possui contraprovas? Descreva ou envie links.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const modalRow1 = new ActionRowBuilder().addComponents(nicknameInput);
        const modalRow2 = new ActionRowBuilder().addComponents(dateInput);
        const modalRow3 = new ActionRowBuilder().addComponents(evidenceInput);

        modal.addComponents(modalRow1, modalRow2, modalRow3);
        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'appeal_form') {
        const nickname = interaction.fields.getTextInputValue('nickname');
        const punishmentDate = interaction.fields.getTextInputValue('punishment_date');
        const evidence = interaction.fields.getTextInputValue('evidence') || 'Nenhuma contraprova enviada.';

        const category = interaction.guild.channels.cache.find(
            (c) => c.name === 'Appeals' && c.type === ChannelType.GuildCategory
        ) || (await interaction.guild.channels.create({
            name: 'Appeals',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
                { id: PERMISSION_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
            ],
        }));

        const appealChannel = await interaction.guild.channels.create({
            name: `appeal-${interaction.user.username}`,
            parent: category,
            topic: `Revisão solicitada por ${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: PERMISSION_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const appealEmbed = new EmbedBuilder()
            .setAuthor({
                name: 'LeagueMC • Sistema de Revisões',
                iconURL: 'https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048',
            })
            .setDescription(
                `**Nickname:** ${nickname}\n**Data da punição:** ${punishmentDate}\n**Contraprovas:** ${evidence}`
            )
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' })
            .setThumbnail('https://cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?size=2048');

        const appealRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept_appeal')
                .setLabel('🟢 Aceitar Revisão')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('deny_appeal')
                .setLabel('🔴 Negar Revisão')
                .setStyle(ButtonStyle.Danger)
        );

        await appealChannel.send({ embeds: [appealEmbed], components: [appealRow] });
        await interaction.reply({ content: 'Sua solicitação foi enviada com sucesso!', ephemeral: true });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'accept_appeal' || interaction.customId === 'deny_appeal') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Você não tem permissão para interagir com esses botões.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Status da revisão:')
            .setDescription(
                interaction.customId === 'accept_appeal'
                    ? 'A sua revisão foi **ACEITA**. Pedimos perdão pelo transtorno.'
                    : 'A sua revisão foi **NEGADA**. Após uma análise de nossa equipe, constatamos que a punição foi aplicada de forma correta.'
            )
            .setColor(interaction.customId === 'accept_appeal' ? '#00FF00' : '#FF0000')
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
});

const reportSystem = new ReportSystem();

const REPORT_CHANNEL_ID = '1332829887316103239'; 
const LOG_CHANNEL_ID = '1332854330394673202'; 

client.on('messageCreate', async (message) => {
    if (message.channel.id === REPORT_CHANNEL_ID && !message.author.bot) {
        
        const report = reportSystem.addReport(message.author.id, 'N/A', message.content);

        
        await message.delete();

        
        const confirmationEmbed = new EmbedBuilder()
            .setAuthor({
                name: 'LeagueMC',
                iconURL: 'https://images-ext-1.discordapp.net/external/mokVSKt7XytLp-whP27nUIQGZTx_e1eCNaJJnpLwO9o/%3Fsize%3D2048/https/cdn.discordapp.com/icons/1319414145464012951/57f0a7f47f91a89374ed69a4be4a4c0f.png?format=webp&quality=lossless',
            })
            .setDescription(
                'Sua denúncia foi enviada com sucesso e já está sendo analisada por uma equipe responsável. Agradecemos pelo seu report.\n\n' +
                '**Observação:** Lembre-se de habilitar as mensagens diretas do servidor para uma resposta.'
                
            )
            .setColor('Grey')
            .setFooter({ text: '© LeagueMC • Todos os direitos reservados' });

        const msg = await message.channel.send({ embeds: [confirmationEmbed] });
        setTimeout(async () => {
            await msg.delete()
        }, 5000);

        
        const logEmbed = new EmbedBuilder()
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(`## **🚨 Nova denúncia registrada:**\n${message.content}`)
            .setColor('Grey')
            .setFooter({ text: `Denúncia ID: ${report.id}` });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            
                .setCustomId(`accept_${report.id}`) 
                .setLabel('Aceitar denúncia')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()

                .setCustomId(`deny_${report.id}`)
                .setLabel('Negar denúncia')
                .setStyle(ButtonStyle.Danger)
        );

        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed], components: [buttons] });
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    try {
    const [action, reportId] = interaction.customId.split('_');
    const report = reportSystem.getReportById(Number(reportId));

    const reporter = await interaction.guild.members.fetch(report.reporterId);

    if (action === 'accept') {
        
        if (reporter) {
            await reporter.send('❌ | Olá, jogador! Constamos que o seu último report foi **ACEITO**. A equipe do LeagueMC agradece pela colaboração!');
        }

        await interaction.reply({ content: 'Denúncia aceita e o jogador foi notificado.', ephemeral: true });
    } else if (action === 'deny') {
        
        if (reporter) {
            await reporter.send(
                '✔️ | Olá, jogador! A sua denúncia foi **NEGADA**. Após uma análise, constatamos que as provas não foram suficientes para uma punição.'
            );
        }

        await interaction.reply({ content: 'Denúncia negada e o jogador foi notificado.', ephemeral: true });
    } 
} catch(erro) { 
    console.log("")
} 
});

client.login(TOKEN);