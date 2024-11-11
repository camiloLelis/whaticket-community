import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Paper from "@material-ui/core/Paper";
import SearchTermsConversation from "../SearchTermsConversation";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		flexDirection: "column",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		position: "absolute",
	},
	header: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(1),
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: "#eee",
		justifyContent: "space-between",
	},
	content: {
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2),
		backgroundColor: "#fafafa",
		height: "100%",
		overflowY: "scroll",
	},
}));

const SearchMessage = ({ open, onClose }) => {
	const classes = useStyles();

	return (
		<Drawer
			className={classes.drawer}
			variant="persistent"
			anchor="right"
			open={open}
			PaperProps={{ style: { position: "absolute" } }}
			BackdropProps={{ style: { position: "absolute" } }}
			ModalProps={{
				container: document.getElementById("drawer-container"),
				style: { position: "absolute" },
			}}
			classes={{
				paper: classes.drawerPaper,
			}}
		>
			<div className={classes.header}>
				<Typography variant="h6">Pesquisar Mensagem</Typography>
				<IconButton onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</div>
			<div className={classes.content}>
				<Paper square variant="outlined" style={{ padding: 16 }}>
					<SearchTermsConversation />
				</Paper>
			</div>
		</Drawer>
	);
};

export default SearchMessage;
