import phoneApi from 'api/phoneApi';
import {
	fetchPhones,
	phoneActions,
	selectPhoneFilter,
	selectPhoneLoading,
	selectPhonePagination,
	selectPhones,
	selectPhoneSelectedItems
} from 'app/phoneSlice';
import { SplitButton } from 'components/Buttons/SplitButton';
import { Confirm, ITMPagination } from 'components/Common/';
import { useEffect, useState } from 'react';
import { Alert, Card, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
	PhoneColorModal,
	PhoneFilter,
	PhoneList,
	PhoneModal,
	PhoneModelModal,
	PhoneRamModal,
	PhoneRomModal
} from './components';

const PhonePage = () => {
	// Confirm
	const [confirm, setConfirm] = useState({});

	const handleCloseConfirm = () => {
		setConfirm({ ...confirm, show: false });
	};

	// Filter
	const filter = useSelector(selectPhoneFilter);

	const handleFilter = formValues => {
		if (loading || loadingTimmer > 0) return;

		const { key, category, status } = formValues;

		let newFilter = {
			key: key !== '' ? key : undefined,
			category: category !== '' ? category : undefined,
			status: status !== '' ? status : undefined,
			_page: 1,
			_limit: filter._limit
		};

		dispatch(phoneActions.setFilter(newFilter));
	};

	const handleResetFilter = () => {
		if (loading || loadingTimmer > 0) return;

		dispatch(
			phoneActions.setFilter({
				key: undefined,
				category: undefined,
				status: undefined,
				_page: 1,
				_limit: filter._limit
			})
		);
	};

	// SelectedItems
	const selectedItems = useSelector(selectPhoneSelectedItems);

	const handleSelectItem = params => {
		if (params.all !== undefined) {
			const newSelectedItems = params.all
				? phones.map(item => item._id)
				: [];

			dispatch(phoneActions.setSelectedItems(newSelectedItems));
		} else {
			const newSelectedItems = params.checked
				? [...selectedItems, params._id]
				: selectedItems.filter(item => item !== params._id);

			dispatch(phoneActions.setSelectedItems(newSelectedItems));
		}
	};

	// Loading
	const loading = useSelector(selectPhoneLoading);
	const [loadingTimmer, setLoadingTimmer] = useState(0.5);
	useEffect(() => {
		setTimeout(() => {
			if (loadingTimmer > 0) setLoadingTimmer(loadingTimmer - 0.1);
		}, 100);
	}, [loadingTimmer]);

	// Fetch phones
	const dispatch = useDispatch();
	const phones = useSelector(selectPhones);

	useEffect(() => {
		dispatch(fetchPhones(filter));
		setLoadingTimmer(0.5);
		dispatch(phoneActions.setSelectedItems([]));
	}, [dispatch, filter]);

	// Modal
	const [showModal, setShowModal] = useState(false);
	const [showBackdrop, setShowBackdrop] = useState(false);
	const [updatedPhone, setUpdatedPhone] = useState({});

	const handleShowModal = phone => {
		setUpdatedPhone({ ...phone });
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);

		setConfirm({
			show: true,
			message: 'Ba??n ch??a l??u d???? li????u. V????n ??o??ng c????a s?????',
			onCancel: () => setShowModal(true)
		});
	};

	// Update phone
	const handleUpdatePhone = async phone => {
		try {
			const res = phone._id
				? await phoneApi.update(phone)
				: await phoneApi.add(phone);

			if (res.status) {
				toast.success(res.message);
				setShowModal(false);
				if (phone._id) dispatch(phoneActions.setPhone(res.phone));
				else dispatch(phoneActions.setFilter({ ...filter }));
			} else {
				toast.error(res.message);
			}
		} catch (error) {
			toast.error('L????i h???? th????ng!');
		}
	};

	const handleUpdatePhoneStatus = async phone => {
		setConfirm({
			show: true,
			message: (
				<>
					C????p nh????t tra??ng tha??i hi????n thi?? cu??a ??i????n thoa??i{' '}
					<b>{phone.name}</b>?
				</>
			),
			onSuccess: async () => {
				try {
					const newPhone = {
						_id: phone._id,
						status: !phone.status
					};

					const res = await phoneApi.update(newPhone);

					if (res.status) {
						toast.success(
							<>
								C????p nh????t tra??ng tha??i hi????n thi?? cu??a ??i????n thoa??i{' '}
								<b>{phone.name}</b> tha??nh c??ng!
							</>
						);
						dispatch(phoneActions.setPhone(res.phone));
					} else {
						toast.error(
							<>
								C????p nh????t tra??ng tha??i hi????n thi?? cu??a ??i????n thoa??i{' '}
								<b>{phone.name}</b> kh??ng tha??nh c??ng!
							</>
						);
					}
				} catch (error) {
					toast.error(
						<>
							L???i h??? th???ng! C????p nh????t tra??ng tha??i hi????n thi?? cu??a ??i????n
							thoa??i <b>{phone.name}</b> tha??nh c??ng!
						</>
					);
				}
			}
		});
	};

	// Remove phones
	const handleRemovePhone = async phone => {
		setConfirm({
			show: true,
			message: (
				<>
					Xo??a ??i????n thoa??i <b>{phone.name}</b> kho??i h???? th????ng?
				</>
			),
			onSuccess: async () => {
				try {
					const res = await phoneApi.remove(phone._id);

					if (res.status) {
						toast.success(
							<>
								X??a ??i???n tho???i <b>{phone.name}</b> th??nh c??ng!
							</>
						);
						dispatch(phoneActions.setFilter({ ...filter }));
					} else {
						toast.error(
							<>
								X??a ??i???n tho???i <b>{phone.name}</b> kh??ng th??nh
								c??ng!
							</>
						);
					}
				} catch (error) {
					toast.error(
						<>
							L???i h??? th???ng! X??a ??i???n tho???i <b>{phone.name}</b>{' '}
							kh??ng th??nh c??ng!
						</>
					);
				}
			}
		});
	};

	const handleRemovePhoneSelections = async () => {
		setConfirm({
			show: true,
			message: 'Xo??a nh????ng ??i????n thoa??i ??a?? cho??n kho??i h???? th????ng?',
			onSuccess: async () => {
				const removeSuccess = new Promise(async (resolve, reject) => {
					for (let i = 0; i < selectedItems.length; i++) {
						try {
							const res = await phoneApi.remove(selectedItems[i]);

							if (res.status) {
								toast.success(
									<>
										X??a ??i???n tho???i <b>{res.phone.name} </b>
										th??nh c??ng!
									</>
								);
							} else {
								toast.error(
									<>
										X??a ??i???n tho???i <b>{res.phone.name}</b>
										kh??ng th??nh c??ng!
									</>
								);
							}

							if (i === selectedItems.length - 1) resolve(true);
						} catch (error) {
							toast.error(
								'L????i h???? th????ng! Xo??a ??i????n thoa??i kh??ng tha??nh c??ng!'
							);
						}
					}
				});

				if (await removeSuccess)
					dispatch(phoneActions.setFilter({ ...filter }));
			}
		});
	};

	// Pagination
	const pagination = useSelector(selectPhonePagination);

	const handlePageChange = _page => {
		if (_page !== pagination._page)
			dispatch(
				phoneActions.setFilter({
					...filter,
					_page,
					_limit: pagination._limit
				})
			);
	};

	// Rom Modal
	const [showRomModal, setShowRomModal] = useState(false);

	const handleShowRomModal = () => {
		setShowRomModal(true);
		setShowBackdrop(true);
	};

	const handleCloseRomModal = () => {
		setShowRomModal(false);
		setShowBackdrop(false);
	};

	// Roms
	const [roms, setRoms] = useState([]);

	const sortAndUpdateRoms = newRoms => {
		newRoms.sort((x, y) => x.localeCompare(y));
		setRoms(newRoms);
	};

	const handleUpdateRom = newRom => {
		// Check for rom exists
		const index = roms.findIndex(rom => rom === newRom);

		if (index >= 0) {
			toast.error('Ba??n rom na??y ??a?? t????n ta??i!');
			return;
		}

		// All good
		const newRoms = [...roms, newRom];

		sortAndUpdateRoms(newRoms);
		toast.success(
			<>
				Th??m m????i rom <b>{newRom}</b> tha??nh c??ng!
			</>
		);
		handleCloseRomModal();
	};

	const handleRemoveRom = removedRom => {
		setShowBackdrop(true);

		setConfirm({
			show: true,
			title: 'Xo??a Rom',
			message: (
				<>
					Xo??a ba??n rom <b>{removedRom}</b> kho??i ??i????n thoa??i?
					<br />
					<Alert variant="danger" className="mt-2 mb-0">
						L??u y??: Xo??a ba??n rom na??y co?? th???? se?? a??nh h??????ng t????i ca??c phi??n
						ba??n ??i????n thoa??i li??n quan!
					</Alert>
				</>
			),
			onSuccess: () => {
				const newRoms = roms.filter(rom => rom !== removedRom);
				const newModels = models.filter(
					model => model.rom !== removedRom
				);

				sortAndUpdateRoms(newRoms);
				sortAndUpdateModels(newModels);
				setShowBackdrop(false);
				toast.success(
					<>
						Xo??a tha??nh c??ng ba??n rom <b>{removedRom}</b>!
					</>
				);
			},
			onClose: () => {
				handleCloseConfirm();
				setShowBackdrop(false);
			}
		});
	};

	// Rom options
	const [romOptions, setRomOptions] = useState([
		{ value: '', label: 'Cho??n rom' }
	]);

	useEffect(() => {
		const handleUpdateRomOptions = () => {
			const newRomOptions =
				roms.length > 0
					? roms.map(rom => ({ value: rom, label: rom }))
					: [];

			newRomOptions.unshift({ value: '', label: 'Cho??n rom' });
			setRomOptions(newRomOptions);
		};

		handleUpdateRomOptions();
	}, [roms]);

	// Ram Modal
	const [showRamModal, setShowRamModal] = useState(false);

	const handleShowRamModal = () => {
		setShowRamModal(true);
		setShowBackdrop(true);
	};

	const handleCloseRamModal = () => {
		setShowRamModal(false);
		setShowBackdrop(false);
	};

	// Rams
	const [rams, setRams] = useState([]);

	const sortAndUpdateRams = newRams => {
		newRams.sort((x, y) => x.localeCompare(y));
		setRams(newRams);
	};

	const handleUpdateRam = newRam => {
		// Check for ram exists
		const index = rams.findIndex(ram => ram === newRam);

		if (index >= 0) {
			toast.error('Ba??n ram na??y ??a?? t????n ta??i!');
			return;
		}

		// All good
		const newRams = [...rams, newRam];

		sortAndUpdateRams(newRams);
		toast.success(
			<>
				Th??m m????i ram <b>{newRam}</b> tha??nh c??ng!
			</>
		);
		handleCloseRamModal();
	};

	const handleRemoveRam = removedRam => {
		setShowBackdrop(true);

		setConfirm({
			show: true,
			title: 'Xo??a Ram',
			message: (
				<>
					Xo??a ba??n ram <b>{removedRam}</b> kho??i ??i????n thoa??i?
					<br />
					<Alert className="mt-2 mb-0" variant="danger">
						L??u y??: Xo??a ba??n ram na??y co?? th???? se?? a??nh h??????ng t????i ca??c phi??n
						ba??n ??i????n thoa??i li??n quan!
					</Alert>
				</>
			),
			onSuccess: () => {
				const newRams = rams.filter(ram => ram !== removedRam);
				const newModels = models.filter(
					model => model.ram !== removedRam
				);

				sortAndUpdateRams(newRams);
				sortAndUpdateModels(newModels);
				setShowRamModal(false);
				setShowBackdrop(false);
				toast.success(
					<>
						Xo??a tha??nh c??ng ba??n ram <b>{removedRam}</b>!
					</>
				);
			},
			onClose: () => {
				handleCloseConfirm();
				setShowBackdrop(false);
			}
		});
	};

	// Ram options
	const [ramOptions, setRamOptions] = useState([
		{ value: '', label: 'Cho??n ram' }
	]);

	useEffect(() => {
		const handleUpdateRamOptions = () => {
			const newRamOptions =
				rams.length > 0
					? rams.map(ram => ({ value: ram, label: ram }))
					: [];

			newRamOptions.unshift({ value: '', label: 'Cho??n ram' });
			setRamOptions(newRamOptions);
		};

		handleUpdateRamOptions();
	}, [rams]);

	// Color Modal
	const [showColorModal, setShowColorModal] = useState(false);

	const handleShowColorModal = () => {
		setShowColorModal(true);
		setShowBackdrop(true);
	};

	const handleCloseColorModal = () => {
		setShowColorModal(false);
		setShowBackdrop(false);
	};

	// Colors
	const [colors, setColors] = useState([]);

	const sortAndUpdateColors = newColors => {
		newColors.sort((x, y) => x.localeCompare(y));
		setColors(newColors);
	};

	const handleUpdateColor = newColor => {
		// Check for color exists
		const index = colors.findIndex(color => color === newColor);

		if (index >= 0) {
			toast.error('Ma??u na??y ??a?? t????n ta??i!');
			return;
		}

		// All good
		const newColors = [...colors, newColor];

		sortAndUpdateColors(newColors);
		toast.success(
			<>
				Th??m m????i ma??u <b>{newColor}</b> tha??nh c??ng!
			</>
		);
		handleCloseColorModal();
	};

	const handleRemoveColor = removedColor => {
		setShowBackdrop(true);

		setConfirm({
			show: true,
			title: 'Xo??a Ma??u',
			message: (
				<>
					Xo??a m??u <b>{removedColor}</b> kho??i ??i????n thoa??i?
					<Alert className="mt-2 mb-0" variant="danger">
						L??u y??: Xo??a ba??n ma??u na??y co?? th???? se?? a??nh h??????ng t????i ca??c phi??n
						ba??n ??i????n thoa??i va?? hi??nh a??nh li??n quan!
					</Alert>
				</>
			),
			onSuccess: () => {
				const newColors = colors.filter(
					color => color !== removedColor
				);
				const newModels = models.filter(
					model => model.color !== removedColor
				);
				const newPhotos = photos.filter(
					photo => photo.title !== removedColor
				);

				sortAndUpdateColors(newColors);
				sortAndUpdateModels(newModels);
				sortAndUpdatePhotos(newPhotos);
				setShowBackdrop(false);
				toast.success(
					<>
						Xo??a tha??nh c??ng ma??u <b>{removedColor}</b>!
					</>
				);
			},
			onClose: () => {
				handleCloseConfirm();
				setShowBackdrop(false);
			}
		});
	};

	// Color options
	const [colorOptions, setColorOptions] = useState([
		{ value: '', label: 'Cho??n ma??u' }
	]);

	useEffect(() => {
		const handleUpdateColorOptions = () => {
			const newColorOptions =
				colors.length > 0
					? colors.map(color => ({ value: color, label: color }))
					: [];

			newColorOptions.unshift({ value: '', label: 'Cho??n ma??u' });
			setColorOptions(newColorOptions);
		};

		handleUpdateColorOptions();
	}, [colors]);

	// ModelModal
	const [showModelModal, setShowModelModal] = useState(false);
	const [updatedModel, setUpdatedModel] = useState({});

	const handleShowModelModal = model => {
		setShowModelModal(true);
		setShowBackdrop(true);
		setUpdatedModel({ ...model });
	};

	const handleCloseModelModal = () => {
		setShowModelModal(false);
		setShowBackdrop(false);
	};

	// Models
	const [models, setModels] = useState([]);

	const sortAndUpdateModels = newModels => {
		newModels = [...newModels].sort((x, y) =>
			(x.rom + x.ram + x.color).localeCompare(y.rom + y.ram + y.color)
		);

		setModels(newModels);
	};

	const handleUpdateModel = (newModel, isUpdate) => {
		let newModels;

		if (isUpdate) {
			newModels = [...models];
			const index = newModels.findIndex(
				model =>
					`${model.rom}${model.ram}${model.color}` ===
					`${newModel.rom}${newModel.ram}${newModel.color}`
			);
			newModels[index] = newModel;

			toast.success(
				<>
					C????p nh????t phi??n ba??n ??i??n thoa??i{' '}
					<b>
						{newModel.rom} / {newModel.ram} / {newModel.color}
					</b>{' '}
					tha??nh c??ng!
				</>
			);
		} else {
			const index = models.findIndex(
				model =>
					`${model.rom}${model.ram}${model.color}` ===
					`${newModel.rom}${newModel.ram}${newModel.color}`
			);

			if (index >= 0) {
				toast.error(
					<>
						Phi??n ba??n ??i??n thoa??i{' '}
						<b>
							{newModel.rom} / {newModel.ram} / {newModel.color}
						</b>{' '}
						??a?? t???n t???i!
					</>
				);
				return;
			}

			newModels = [...models, newModel];
			toast.success(
				<>
					Th??m m????i phi??n ba??n ??i??n thoa??i{' '}
					<b>
						{newModel.rom} / {newModel.ram} / {newModel.color}
					</b>{' '}
					tha??nh c??ng!
				</>
			);
		}

		sortAndUpdateModels(newModels);
		handleCloseModelModal();
	};

	const handleRemoveModel = deletedModel => {
		setShowBackdrop(true);

		setConfirm({
			show: true,
			title: 'Xo??a Phi??n Ba??n',
			message: (
				<>
					Xo??a phi??n ba??n{' '}
					<b>
						{deletedModel.rom} / {deletedModel.ram} /{' '}
						{deletedModel.color}
					</b>
					?
				</>
			),
			onSuccess: () => {
				let newModels = models.filter(
					model =>
						`${model.rom}${model.ram}${model.color}` !==
						`${deletedModel.rom}${deletedModel.ram}${deletedModel.color}`
				);

				sortAndUpdateModels(newModels);
				toast.success(
					<>
						Xo??a phi??n ba??n ??i????n thoa??i{' '}
						<b>
							{deletedModel.rom} / {deletedModel.ram} /{' '}
							{deletedModel.color}
						</b>{' '}
						tha??nh c??ng!
					</>
				);
				setShowBackdrop(false);
			},
			onClose: () => {
				handleCloseConfirm();
				setShowBackdrop(false);
			}
		});
	};

	// Photos
	const [photos, setPhotos] = useState([]);

	const sortAndUpdatePhotos = newPhotos => {
		newPhotos = [...newPhotos].sort((x, y) =>
			x.title.localeCompare(y.title)
		);
		setPhotos(newPhotos);
	};

	const handleRemovePhoto = deletedPhoto => {
		setShowBackdrop(true);

		setConfirm({
			show: true,
			title: 'Xo??a Hi??nh A??nh',
			message: `Xo??a hi??nh a??nh na??y kho??i ??i????n thoa??i?`,
			onSuccess: () => {
				const newPhotos = [...photos];

				const index = newPhotos.findIndex(
					photo => photo.url === deletedPhoto.url
				);
				newPhotos.splice(index, 1);
				sortAndUpdatePhotos(newPhotos);
				toast.success('Xo??a hi??nh a??nh kho??i ??i????n thoa??i tha??nh c??ng!');
				setShowBackdrop(false);
			},
			onClose: () => {
				handleCloseConfirm();
				setShowBackdrop(false);
			}
		});
	};

	// Show list
	const dataJSX = (
		<div>
			<PhoneList
				selectedItems={selectedItems}
				phones={phones}
				onSelectItem={handleSelectItem}
				onShowModal={handleShowModal}
				onUpdatePhoneStatus={handleUpdatePhoneStatus}
				onRemovePhone={handleRemovePhone}
			/>
			<ITMPagination
				size="sm"
				pagination={pagination}
				onChange={handlePageChange}
			/>
		</div>
	);
	const noDataJSX = <Alert variant="danger">Kh??ng co?? d???? li????u</Alert>;
	const loadingJSX = <ProgressBar animated now={100}></ProgressBar>;

	// Return
	return (
		<Card className="shadow mb-4">
			<Card.Header className="fw-bold">??i????n Thoa??i</Card.Header>
			<Card.Body>
				<div>
					<SplitButton
						icon="fas fa-fw fa-plus"
						text="Th??m m????i"
						className="mb-3 me-2"
						onClick={handleShowModal}
					/>
					<SplitButton
						disabled={selectedItems.length <= 0}
						variant="danger"
						icon="fas fa-fw fa-trash"
						text="Xo??a"
						className="mb-3"
						onClick={handleRemovePhoneSelections}
					/>
				</div>
				<PhoneFilter
					filter={filter}
					onFilter={handleFilter}
					onReset={handleResetFilter}
				/>
				<PhoneModal
					show={showModal}
					showBackdrop={showBackdrop}
					initialValues={updatedPhone}
					setShow={setShowModal}
					onSubmit={handleUpdatePhone}
					onClose={handleCloseModal}
					// Roms
					roms={roms}
					setRoms={setRoms}
					handleShowRomModal={handleShowRomModal}
					handleRemoveRom={handleRemoveRom}
					// Rams
					rams={rams}
					setRams={setRams}
					handleShowRamModal={handleShowRamModal}
					handleRemoveRam={handleRemoveRam}
					// Colors
					colors={colors}
					setColors={setColors}
					handleShowColorModal={handleShowColorModal}
					handleRemoveColor={handleRemoveColor}
					// Models
					models={models}
					setModels={setModels}
					handleShowModelModal={handleShowModelModal}
					handleRemoveModel={handleRemoveModel}
					// Photos
					photos={photos}
					setPhotos={setPhotos}
					handleRemovePhoto={handleRemovePhoto}
				/>

				{/* Modal */}
				<PhoneRomModal
					show={showRomModal}
					onSubmit={handleUpdateRom}
					onClose={handleCloseRomModal}
				/>
				<PhoneRamModal
					show={showRamModal}
					onSubmit={handleUpdateRam}
					onClose={handleCloseRamModal}
				/>
				<PhoneColorModal
					show={showColorModal}
					onSubmit={handleUpdateColor}
					onClose={handleCloseColorModal}
				/>
				<PhoneModelModal
					show={showModelModal}
					model={updatedModel}
					romOptions={romOptions}
					ramOptions={ramOptions}
					colorOptions={colorOptions}
					onSubmit={handleUpdateModel}
					onClose={handleCloseModelModal}
				/>

				{loading || loadingTimmer > 0
					? loadingJSX
					: phones.length > 0
					? dataJSX
					: noDataJSX}

				<Confirm
					show={confirm.show}
					title={confirm.title}
					message={confirm.message}
					onClose={confirm.onClose || handleCloseConfirm}
					onCancel={confirm.onCancel}
					onSuccess={confirm.onSuccess}
				/>
			</Card.Body>
		</Card>
	);
};

export default PhonePage;
